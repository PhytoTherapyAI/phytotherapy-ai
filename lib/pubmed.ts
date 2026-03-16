const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: string;
  url: string;
}

export async function searchPubMed(
  query: string,
  maxResults: number = 5
): Promise<PubMedArticle[]> {
  try {
    const apiKey = process.env.PUBMED_API_KEY;
    const keyParam = apiKey ? `&api_key=${apiKey}` : "";

    // Step 1: Search for article IDs (with timeout)
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=relevance&retmode=json${keyParam}`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });

    if (!searchRes.ok) {
      console.error("PubMed search failed:", searchRes.status);
      return [];
    }

    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    // Step 2: Fetch article details (with timeout)
    const fetchUrl = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${ids.join(",")}&retmode=xml${keyParam}`;
    const fetchRes = await fetch(fetchUrl, { signal: AbortSignal.timeout(8000) });

    if (!fetchRes.ok) {
      console.error("PubMed fetch failed:", fetchRes.status);
      return [];
    }

    const xmlText = await fetchRes.text();
    return parseArticles(xmlText, ids);
  } catch (error) {
    // PubMed is non-critical — log and continue without sources
    console.error("PubMed API error (continuing without sources):", error);
    return [];
  }
}

function parseArticles(xml: string, ids: string[]): PubMedArticle[] {
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
    });
  }

  return articles;
}
