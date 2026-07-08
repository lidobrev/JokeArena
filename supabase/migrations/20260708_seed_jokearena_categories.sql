-- Safe starter categories for JokeArena.
-- Run with: supabase db push
insert into public.joke_categories (name, slug, description)
values
  ('Programming', 'programming', 'Jokes about code, bugs, developers and computers.'),
  ('Office', 'office', 'Work, meetings, coworkers and corporate chaos.'),
  ('School', 'school', 'School, exams, teachers and student life.'),
  ('Food', 'food', 'Food, restaurants and kitchen humor.'),
  ('Dark Humor', 'dark-humor', 'Darker jokes that still follow platform rules.'),
  ('Animals', 'animals', 'Pets, animals and wildlife jokes.'),
  ('Random', 'random', 'Everything else that makes people laugh.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;
