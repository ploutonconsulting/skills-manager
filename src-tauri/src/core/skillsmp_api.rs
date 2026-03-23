use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use super::skillssh_api::SkillsShSkill;

#[derive(Debug, Deserialize)]
struct SkillsMpSkill {
    name: Option<String>,
    source: Option<String>,
    #[serde(default)]
    stars: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SearchMode {
    Keyword,
    Ai,
}

impl SearchMode {
    fn endpoint(&self) -> &str {
        match self {
            Self::Keyword => "https://skillsmp.com/api/v1/skills/search",
            Self::Ai => "https://skillsmp.com/api/v1/skills/ai-search",
        }
    }
}

pub fn search(
    api_key: &str,
    query: &str,
    mode: SearchMode,
    page: Option<u32>,
    limit: Option<u32>,
) -> Result<Vec<SkillsShSkill>> {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .build()?;

    let mut url = format!(
        "{}?q={}",
        mode.endpoint(),
        urlencoding::encode(query),
    );
    if let Some(p) = page {
        url.push_str(&format!("&page={}", p));
    }
    if let Some(l) = limit {
        url.push_str(&format!("&limit={}", l.min(100)));
    }

    let resp: serde_json::Value = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("User-Agent", "skills-manager/1.0.0")
        .send()
        .context("Failed to fetch skillsmp.com")?
        .json()
        .context("Failed to parse SkillsMP response")?;

    // Check for error responses
    if let Some(err) = resp.get("error") {
        let code = err
            .get("code")
            .and_then(|v| v.as_str())
            .unwrap_or("UNKNOWN");
        let msg = err
            .get("message")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown error");
        anyhow::bail!("SkillsMP API error ({}): {}", code, msg);
    }

    // Parse skills from response — try "skills" array first, then "results"
    let raw_skills: Vec<SkillsMpSkill> = if let Some(arr) = resp.get("skills").and_then(|v| v.as_array()) {
        serde_json::from_value(serde_json::Value::Array(arr.clone())).unwrap_or_default()
    } else if let Some(arr) = resp.get("results").and_then(|v| v.as_array()) {
        serde_json::from_value(serde_json::Value::Array(arr.clone())).unwrap_or_default()
    } else if let Some(arr) = resp.as_array() {
        serde_json::from_value(serde_json::Value::Array(arr.clone())).unwrap_or_default()
    } else {
        Vec::new()
    };

    Ok(raw_skills
        .into_iter()
        .filter_map(|s| {
            let source = s.source?;
            let name = s.name?;
            // SkillsMP uses "owner/repo/skill" or "owner/repo" as source
            // We need to split into source + skill_id
            let (src, skill_id) = if let Some(pos) = source.rfind('/') {
                let (a, b) = source.split_at(pos);
                (a.to_string(), b[1..].to_string())
            } else {
                (source.clone(), name.clone())
            };
            let id = format!("{}/{}", src, skill_id);
            Some(SkillsShSkill {
                id,
                skill_id,
                name,
                source: src,
                installs: s.stars,
            })
        })
        .collect())
}
