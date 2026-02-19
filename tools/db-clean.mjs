import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim();
}

function tryRun(cmd) {
  try {
    return run(cmd);
  } catch {
    return '';
  }
}

function main() {
  // 1) Supabase containers are labeled with com.supabase.cli.project.
  // We'll discover active project labels and clean the one(s) relevant to this repo.
  // Priority:
  //   a) If this repo has a supabase/config.toml, use its directory name hint as a filter.
  //   b) Otherwise, list all supabase projects and ask docker for container ids per label.
  //
  // We avoid hardcoding "infra" so the script survives repo renames.

  // list all supabase-related containers
  const all = tryRun(
    `docker ps -a --filter "label=com.supabase.cli.project" --format "{{.ID}} {{.Labels}}"`,
  );
  if (!all) {
    console.log('[db:clean] No containers with com.supabase.cli.project label found.');
    return;
  }

  // Extract unique project names from labels like: "...com.supabase.cli.project=XYZ,..."
  const projectSet = new Set();
  for (const line of all.split(/\r?\n/)) {
    const m = line.match(/com\.supabase\.cli\.project=([^, ]+)/);
    if (m?.[1]) projectSet.add(m[1]);
  }

  if (projectSet.size === 0) {
    console.log('[db:clean] No supabase project labels found.');
    return;
  }

  // Heuristic: choose the project that matches current folder name, else clean all projects.
  const cwdName = process.cwd().split(/[\\/]/).filter(Boolean).pop();
  const projects = [...projectSet];
  const targetProjects = projects.includes(cwdName) ? [cwdName] : projects;

  console.log(`[db:clean] Found supabase projects: ${projects.join(', ')}`);
  console.log(`[db:clean] Cleaning: ${targetProjects.join(', ')}`);

  let removed = 0;
  for (const proj of targetProjects) {
    const ids = tryRun(`docker ps -a -q --filter "label=com.supabase.cli.project=${proj}"`);
    if (!ids) continue;

    const list = ids.split(/\r?\n/).filter(Boolean);
    console.log(`[db:clean] Removing ${list.length} containers for project "${proj}"...`);
    for (const id of list) {
      try {
        execSync(`docker rm -f ${id}`, { stdio: 'inherit' });
        removed++;
      } catch {
        // continue
      }
    }
  }

  if (removed === 0) {
    console.log('[db:clean] Nothing removed.');
  } else {
    console.log(`[db:clean] Done. Removed ${removed} container(s).`);
  }
}

main();
