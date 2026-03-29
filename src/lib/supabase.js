import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Design sessions ──────────────────────────────────────────────────────────

export async function createSession(designs) {
  const { data: session, error: sessionErr } = await supabase
    .from("design_sessions")
    .insert({})
    .select()
    .single();
  if (sessionErr) throw sessionErr;

  const rows = designs.map((d, i) => ({
    session_id: session.id,
    name: d.name,
    url: d.url,
    storage_path: d.storagePath ?? null,
    position: i,
  }));

  const { error: designsErr } = await supabase
    .from("session_designs")
    .insert(rows);
  if (designsErr) throw designsErr;

  return session.id;
}

export async function loadSession(sessionId) {
  const { data, error } = await supabase
    .from("session_designs")
    .select("*")
    .eq("session_id", sessionId)
    .order("position");
  if (error) throw error;
  return data.map((d) => ({ id: d.id, name: d.name, url: d.url }));
}

export async function saveReview({ sessionId, designId, verdict, annotation, reviewerName }) {
  const { error } = await supabase.from("design_reviews").insert({
    session_id: sessionId,
    design_id: designId,
    verdict,
    annotation: annotation ?? null,
    reviewer_name: reviewerName ?? null,
  });
  if (error) throw error;
}

export async function loadSessionReviews(sessionId) {
  const { data, error } = await supabase
    .from("design_reviews")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");
  if (error) throw error;
  return data;
}

// ── Image upload ─────────────────────────────────────────────────────────────

export async function uploadDesignImage(file) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("designs").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("designs").getPublicUrl(path);
  return { url: data.publicUrl, storagePath: path };
}

// ── Surveys ──────────────────────────────────────────────────────────────────

export async function createSurvey(questions) {
  const { data: survey, error: surveyErr } = await supabase
    .from("surveys")
    .insert({})
    .select()
    .single();
  if (surveyErr) throw surveyErr;

  const rows = questions.map((q, i) => ({
    survey_id: survey.id,
    text: q.text,
    emoji: q.emoji,
    position: i,
  }));

  const { error: qErr } = await supabase.from("survey_questions").insert(rows);
  if (qErr) throw qErr;

  return survey.id;
}

export async function loadSurvey(surveyId) {
  const { data, error } = await supabase
    .from("survey_questions")
    .select("*")
    .eq("survey_id", surveyId)
    .order("position");
  if (error) throw error;
  return data.map((q) => ({ id: q.id, text: q.text, emoji: q.emoji }));
}

export async function saveResponse({ surveyId, questionId, answer, reviewerName }) {
  const { error } = await supabase.from("survey_responses").insert({
    survey_id: surveyId,
    question_id: questionId,
    answer,
    reviewer_name: reviewerName ?? null,
  });
  if (error) throw error;
}
