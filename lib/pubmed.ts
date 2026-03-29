const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const EUROPE_PMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest";

export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: string;
  url: string;
  source: "pubmed" | "europepmc" | "crossref";
}

/**
 * Search multiple peer-reviewed databases in parallel:
 * 1. PubMed (NCBI) — largest biomedical literature database
 * 2. Europe PMC — includes PubMed + EMBL-EBI + preprints + WHO sources
 *
 * Results are deduplicated by title similarity and merged.
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 5
): Promise<PubMedArticle[]> {
  const results = await Promise.allSettled([
    searchPubMedCore(query, maxResults),
    searchEuropePMC(query, Math.min(maxResults, 3)),
  ]);

  const pubmedArticles = results[0].status === "fulfilled" ? results[0].value : [];
  const europeArticles = results[1].status === "fulfilled" ? results[1].value : [];

  // Merge & deduplicate by normalized title
  const seen = new Set<string>();
  const merged: PubMedArticle[] = [];

  for (const article of [...pubmedArticles, ...europeArticles]) {
    const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (!seen.has(normalizedTitle)) {
      seen.add(normalizedTitle);
      merged.push(article);
    }
  }

  return merged.slice(0, maxResults);
}

// ── PubMed (NCBI) ──────────────────────────────────
async function searchPubMedCore(
  query: string,
  maxResults: number
): Promise<PubMedArticle[]> {
  try {
    const apiKey = process.env.PUBMED_API_KEY;
    const keyParam = apiKey ? `&api_key=${apiKey}` : "";

    const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=relevance&retmode=json${keyParam}`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });

    if (!searchRes.ok) {
      console.error("PubMed search failed:", searchRes.status);
      return [];
    }

    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const fetchUrl = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${ids.join(",")}&retmode=xml${keyParam}`;
    const fetchRes = await fetch(fetchUrl, { signal: AbortSignal.timeout(8000) });

    if (!fetchRes.ok) {
      console.error("PubMed fetch failed:", fetchRes.status);
      return [];
    }

    const xmlText = await fetchRes.text();
    return parsePubMedArticles(xmlText, ids);
  } catch (error) {
    console.error("PubMed API error (continuing without sources):", error);
    return [];
  }
}

// ── Europe PMC ──────────────────────────────────────
// Covers: PubMed, PMC, EMBL-EBI, Agricola, WHO, ClinicalTrials.gov, preprints
async function searchEuropePMC(
  query: string,
  maxResults: number
): Promise<PubMedArticle[]> {
  try {
    const url = `${EUROPE_PMC_BASE}/search?query=${encodeURIComponent(query)}&format=json&pageSize=${maxResults}&sort=RELEVANCE&resultType=core`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) return [];

    const data = await res.json();
    const results = data.resultList?.result || [];

    return results.map((r: any) => {
      const pmid = r.pmid || r.id || "";
      const source = r.source?.toLowerCase() || "";
      let articleUrl = "";

      if (r.pmid) {
        articleUrl = `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`;
      } else if (r.doi) {
        articleUrl = `https://doi.org/${r.doi}`;
      } else if (r.fullTextUrlList?.fullTextUrl?.[0]?.url) {
        articleUrl = r.fullTextUrlList.fullTextUrl[0].url;
      } else {
        articleUrl = `https://europepmc.org/article/${r.source}/${r.id}`;
      }

      return {
        pmid: String(pmid),
        title: r.title || "Unknown title",
        abstract: r.abstractText || "No abstract available",
        authors: r.authorString ? r.authorString.split(", ").slice(0, 3) : [],
        journal: r.journalTitle || r.bookOrReportDetails?.publisher || source,
        year: r.pubYear || "Unknown year",
        url: articleUrl,
        source: r.pmid ? "pubmed" as const : "europepmc" as const,
      };
    });
  } catch (error) {
    console.error("Europe PMC error (continuing):", error);
    return [];
  }
}

// ── PubMed XML Parser ───────────────────────────────
function parsePubMedArticles(xml: string, ids: string[]): PubMedArticle[] {
  const articles: PubMedArticle[] = [];

  for (const id of ids) {
    const titleMatch = xml.match(
      new RegExp(
        `<PMID[^>]*>${id}</PMID>[\\s\\S]*?<ArticleTitle>([\\s\\S]*?)</ArticleTitle>`
      )
    );
    const abstractMatch = xml.match(
      new RegExp(
        `<PMID[^>]*>${id}</PMID>[\\s\\S]*?<AbstractText[^>]*>([\\s\\S]*?)</AbstractText>`
      )
    );
    const journalMatch = xml.match(
      new RegExp(
        `<PMID[^>]*>${id}</PMID>[\\s\\S]*?<Title>([\\s\\S]*?)</Title>`
      )
    );
    const yearMatch = xml.match(
      new RegExp(
        `<PMID[^>]*>${id}</PMID>[\\s\\S]*?<PubDate>[\\s\\S]*?<Year>(\\d{4})</Year>`
      )
    );

    articles.push({
      pmid: id,
      title: titleMatch?.[1]?.replace(/<[^>]+>/g, "") || "Unknown title",
      abstract:
        abstractMatch?.[1]?.replace(/<[^>]+>/g, "") || "No abstract available",
      authors: [],
      journal: journalMatch?.[1] || "Unknown journal",
      year: yearMatch?.[1] || "Unknown year",
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      source: "pubmed",
    });
  }

  return articles;
}
