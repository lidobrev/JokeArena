insert into public.joke_categories (name, slug, description)
values
  ('Programming', 'programming', 'Jokes about code, bugs, and developers.'),
  ('Office', 'office', 'Jokes about meetings, coworkers, and office life.'),
  ('School', 'school', 'Jokes about classes, teachers, and exams.'),
  ('Food', 'food', 'Jokes about cooking, eating, and cravings.'),
  ('Random', 'random', 'Anything that does not fit elsewhere.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

with joke_templates as (
  select * from (values
    ('programming', 'The compiler sent me flowers', 'My compiler said the code was beautiful, which is a weird way to say it is technically alive.'),
    ('programming', 'The debugger got promotion', 'The debugger kept finding the real problem, so the team made it lead detective.'),
    ('programming', 'The semicolon took a vacation', 'Without a semicolon, the whole project went on a dramatic pause.'),
    ('programming', 'The API wrote a memoir', 'The API was so expressive that every request felt like reading a confession.'),
    ('programming', 'The terminal had opinions', 'My terminal started suggesting fixes, and honestly the advice was better than mine.'),
    ('programming', 'The stack trace became a novel', 'The stack trace had so many chapters that I had to check it out from the library.'),
    ('programming', 'The frontend asked for coffee', 'The frontend needed caffeine before it could handle one more pixel argument.'),
    ('programming', 'The backend stayed mysterious', 'The backend was so quiet that even the logs asked for a status update.'),
    ('programming', 'The loop would not leave', 'That loop was so committed to the bit that even the break statement gave up.'),
    ('programming', 'The code review had feelings', 'The code review was polite, but the red comments clearly had strong opinions.'),
    ('office', 'The meeting that ran forever', 'The meeting lasted so long that the chairs started requesting overtime.'),
    ('office', 'The spreadsheet needed therapy', 'The spreadsheet had so many tabs that it needed a map and a counselor.'),
    ('office', 'The calendar was overbooked', 'My calendar was so full that it started auto-rejecting hope.'),
    ('office', 'The printer joined the resistance', 'The office printer only works when nobody important is watching.'),
    ('office', 'The email thread had a sequel', 'The email thread got so long that everyone forgot the original question.'),
    ('office', 'The desk plant saw everything', 'The desk plant is the only coworker who has survived every team meeting.'),
    ('office', 'The manager loved circles', 'Every answer from management sounded like a paragraph that took the scenic route.'),
    ('office', 'The coffee machine got promoted', 'At this office the coffee machine has more influence than middle management.'),
    ('office', 'The onboarding was a maze', 'The onboarding document was such a maze that I needed onboarding for the onboarding.'),
    ('office', 'The office chair had priorities', 'The office chair was the only thing in the building that clearly supported me.'),
    ('school', 'The homework formed a union', 'The homework was so organized that it demanded better working conditions.'),
    ('school', 'The exam was rude', 'The exam asked every difficult question I had ever met, then said it was just checking in.'),
    ('school', 'The chalkboard remembered everything', 'The chalkboard had more notes on it than my brain had room for.'),
    ('school', 'The class clown improved attendance', 'Nobody skipped class when the class clown was clearly on a roll.'),
    ('school', 'The library whispered secrets', 'The library was so quiet that even my thoughts switched to indoor voices.'),
    ('school', 'The substitute teacher was suspicious', 'The substitute teacher knew the lesson plan, the seating chart, and my excuses.'),
    ('school', 'The cafeteria had strong opinions', 'The cafeteria served mystery soup with confidence I have never seen before.'),
    ('school', 'The report card was honest', 'My report card had the kind of honesty that a best friend would call brutal.'),
    ('school', 'The lesson plan escaped', 'The lesson plan disappeared right after the teacher said we were ahead of schedule.'),
    ('school', 'The pop quiz arrived undercover', 'The pop quiz showed up like a secret agent with a calculator.'),
    ('food', 'The donut missed the meeting', 'The donut arrived late and blamed traffic, which was fair because it had a lot of glaze.'),
    ('food', 'The taco told a secret', 'The taco spilled the beans, then apologized for being too filling.'),
    ('food', 'The pizza slice ran for office', 'The pizza slice promised fairness, extra cheese, and no more crust politics.'),
    ('food', 'The soup had a strategy', 'The soup simmered for so long that it started calling itself a slow cooker of dreams.'),
    ('food', 'The burger wanted a promotion', 'The burger said it was tired of being judged by its layers.'),
    ('food', 'The salad was dramatic', 'The salad claimed it was under a lot of dressing pressure.'),
    ('food', 'The cookie broke into pieces', 'The cookie was so fragile emotionally that it literally crumbled under feedback.'),
    ('food', 'The popcorn could not keep quiet', 'The popcorn kept popping off in the middle of the movie.'),
    ('food', 'The sandwich had layers', 'The sandwich was complex enough to deserve a plot twist and a nap.'),
    ('food', 'The smoothie needed context', 'The smoothie had so many ingredients that it read like a group project.'),
    ('random', 'The umbrella filed a complaint', 'The umbrella said it only gets respect when the forecast is upsetting.'),
    ('random', 'The sock found its purpose', 'One sock always disappears because it is clearly pursuing a different career.'),
    ('random', 'The alarm clock was overqualified', 'The alarm clock has never been late for work, unlike the person it wakes.'),
    ('random', 'The hamster became a consultant', 'The hamster kept running in circles and called it agile planning.'),
    ('random', 'The cactus had boundaries', 'The cactus was the only plant in the room that clearly understood consent.'),
    ('random', 'The moon wanted privacy', 'The moon keeps hanging around because it does not know how to say no to tides.'),
    ('random', 'The keyboard had a secret life', 'Every keyboard has a hidden career in typing things nobody asked for.'),
    ('random', 'The elevator had trust issues', 'The elevator stopped on every floor as if it were waiting for a plot twist.'),
    ('random', 'The cloud needed storage', 'Even the cloud ran out of space and had to ask for a backup plan.'),
    ('random', 'The bicycle preferred honesty', 'The bicycle said it always keeps things two-tired and straightforward.'),
    ('programming', 'The indentation rebelled', 'The indentation was so inconsistent that the parser needed emotional support.'),
    ('programming', 'The cache held grudges', 'The cache remembered old data longer than I remember my password.'),
    ('programming', 'The commit message lied', 'The commit message said small fix, but the diff said this project needed a therapist.'),
    ('programming', 'The null pointer had confidence', 'The null pointer showed up uninvited and still acted like the main character.'),
    ('programming', 'The CSS file chose chaos', 'The CSS file looked at the design and decided symmetry was optional.'),
    ('programming', 'The bug refused to reproduce', 'The bug disappeared every time a senior engineer walked in, like it had tenure.'),
    ('programming', 'The test suite was dramatic', 'The test suite failed with such confidence that I had to respect the commitment.'),
    ('programming', 'The branch needed therapy', 'The branch had so many merge conflicts that it should have come with a mediator.'),
    ('programming', 'The merge request had baggage', 'The merge request brought history, context, and three unrelated arguments.'),
    ('programming', 'The package manager was moody', 'The package manager changed its mind three times before lunch.'),
    ('office', 'The whiteboard had a memory', 'The whiteboard kept every bad idea until someone took a photo and regretted it.'),
    ('office', 'The meeting invite was passive aggressive', 'The meeting invite said optional, but everyone knew the email was lying.'),
    ('office', 'The laptop fan was emotional', 'The laptop fan sounded like it was processing deadlines, feelings, and a spreadsheet.'),
    ('office', 'The badge scanner was judgmental', 'The badge scanner only works when you look confident and slightly caffeinated.'),
    ('office', 'The quarterly report had stage fright', 'The quarterly report took so long to load that it felt like public speaking.'),
    ('office', 'The desk drawer kept secrets', 'The desk drawer contained every charger, receipt, and one unresolved ambition.'),
    ('office', 'The office chair had range', 'The office chair could roll from optimism to despair in one afternoon.'),
    ('office', 'The conference room ghosted us', 'The conference room was always booked by someone who never appeared in person.'),
    ('office', 'The intern found the truth', 'The intern solved the problem in five minutes and ruined three meetings.'),
    ('office', 'The time tracker was suspicious', 'The time tracker counted every minute except the ones spent waiting for approval.'),
    ('school', 'The substitute homework was suspicious', 'The substitute homework acted like the real assignment but with worse handwriting.'),
    ('school', 'The science project exploded politely', 'The science project failed so gracefully that it felt academically supported.'),
    ('school', 'The history quiz lived in the past', 'The history quiz asked questions so old they were already in archives.'),
    ('school', 'The grammar lesson had boundaries', 'The grammar lesson corrected my sentence before I even finished the thought.'),
    ('school', 'The backpack carried ambition', 'My backpack was so heavy it felt like it was transporting future regrets.'),
    ('school', 'The pencil was under pressure', 'The pencil kept breaking because it heard there would be a pop quiz.'),
    ('school', 'The lunch bell had an audience', 'The lunch bell has the quickest approval rating in the entire school.'),
    ('school', 'The final project was overachieving', 'The final project had more ambition than the entire semester combined.'),
    ('school', 'The hallway gossip was academic', 'The hallway gossip spread faster than the principal could say quiet down.'),
    ('school', 'The study group had one goal', 'The study group was united in its mission to do anything except study.'),
    ('food', 'The pasta was al dente and confident', 'The pasta walked in perfectly timed and slightly above the rest of us.'),
    ('food', 'The avocado needed commitment', 'The avocado said it was not ripe for a relationship yet.'),
    ('food', 'The chili had a hot take', 'The chili came in strong and left everyone with a spicy opinion.'),
    ('food', 'The toast was uplifting', 'The toast always rises to the occasion, even when the butter is late.'),
    ('food', 'The ice cream had trust issues', 'The ice cream melted under pressure and said summer is complicated.'),
    ('food', 'The cereal was crunchy under stress', 'The cereal could not handle warm milk or constructive criticism.'),
    ('food', 'The fries went missing', 'The fries were gone before the tray could even be called a tray.'),
    ('food', 'The pancake flipped the narrative', 'The pancake said it is easy to look good on both sides when nobody burns you.'),
    ('food', 'The tea had receipts', 'The tea was hot, sweet, and absolutely ready to expose everyone.'),
    ('food', 'The bacon had confidence', 'The bacon entered the room already convinced it was the main attraction.'),
    ('random', 'The door was open-minded', 'The door said it supports ideas, as long as they are not slammed.'),
    ('random', 'The mirror was honest', 'The mirror never lies, which is why we keep walking past it quickly.'),
    ('random', 'The shoe was left behind', 'One shoe always goes missing because it believes in personal space.'),
    ('random', 'The lamp had a bright future', 'The lamp stayed positive even when the room got dark and awkward.'),
    ('random', 'The pillow was a listener', 'The pillow has heard more secrets than any therapist with a couch.'),
    ('random', 'The clock was over it', 'The clock ticks like it has been waiting for retirement since Monday.'),
    ('random', 'The backpack was overpacked', 'The backpack carried snacks, chargers, and emotional support stationery.'),
    ('random', 'The rain had timing', 'The rain always starts five minutes after you leave the house without an umbrella.'),
    ('random', 'The plant was low maintenance', 'The plant survived because everybody forgot about it with great consistency.'),
    ('random', 'The window had perspective', 'The window looked out on life and decided the indoors was safer.'),
    ('programming', 'The function asked for space', 'The function needed a little room to breathe and a lot less recursion.'),
    ('programming', 'The package was too attached', 'The package dependency tree was basically a family reunion with arguments.'),
    ('programming', 'The config file changed its mind', 'The config file kept muttering about environment variables and emotional stability.'),
    ('programming', 'The breakpoint got promoted', 'The breakpoint had such good timing that it became the team lead.'),
    ('programming', 'The linter refused to relax', 'The linter saw one missing comma and decided the whole project was morally questionable.'),
    ('programming', 'The array needed a vacation', 'The array had too many elements and not enough boundaries.'),
    ('programming', 'The object was deeply nested', 'The object was so nested that archaeologists started getting interested.'),
    ('programming', 'The promise was optimistic', 'The promise kept saying it would resolve soon, which is also how we all manage deadlines.'),
    ('programming', 'The module had an identity crisis', 'The module could not decide if it was helping, exporting, or just being dramatic.'),
    ('programming', 'The environment was unpredictable', 'The environment variables were the only things in the room making any secret sense.'),
    ('office', 'The remote meeting went remote', 'The remote meeting was so disconnected that even the mute button felt lonely.'),
    ('office', 'The desk calendar needed counseling', 'The desk calendar saw too many deadlines and not enough holidays.'),
    ('office', 'The stapler had boundaries', 'The stapler only joins conversations when there is something to hold together.'),
    ('office', 'The break room had politics', 'The break room coffee was strong enough to negotiate a peace treaty.'),
    ('office', 'The spreadsheet had a personality', 'The spreadsheet was the only coworker who could sort itself out.'),
    ('office', 'The company newsletter overshared', 'The company newsletter gave more detail than the entire quarterly meeting.'),
    ('office', 'The office map was outdated', 'The office map still pointed to the printer that had been broken since spring.'),
    ('office', 'The password policy was strict', 'The password policy wanted twelve characters, a symbol, and a childhood memory.'),
    ('office', 'The performance review was poetic', 'The performance review called my work "promising," which is corporate for "please improve."'),
    ('office', 'The open-plan office heard everything', 'The open-plan office was so open that even the gossip had an echo.'),
    ('school', 'The geometry lesson had angles', 'The geometry lesson was full of sharp points and even sharper questions.'),
    ('school', 'The detention room had patience', 'The detention room was the only place in school that truly understood waiting.'),
    ('school', 'The essay was too long', 'The essay kept going because it had a lot to say and nowhere else to be.'),
    ('school', 'The teacher loved examples', 'The teacher used so many examples that the examples needed their own examples.'),
    ('school', 'The projector was temperamental', 'The projector only woke up when it sensed anxiety in the room.'),
    ('school', 'The textbook was stubborn', 'The textbook refused to open unless it believed your grade was serious.'),
    ('school', 'The school bell was punctual', 'The school bell was the only thing there with a healthier work-life balance.'),
    ('school', 'The quiz had no chill', 'The quiz arrived like it had been waiting all week to ruin confidence.'),
    ('school', 'The graduation speech was emotional', 'The graduation speech had just enough sentiment to make everyone suddenly allergic to eye contact.'),
    ('school', 'The lab partner disappeared', 'The lab partner vanished the moment there was work to divide.'),
    ('food', 'The soup was too hot to handle', 'The soup came in steaming and left everybody reconsidering their life choices.'),
    ('food', 'The cake was layered with ambition', 'The cake had more layers than the explanation for why it was missing.'),
    ('food', 'The coffee was deeply committed', 'The coffee was so strong it had already submitted its resignation letter and still kept working.'),
    ('food', 'The sandwich had a strong filling', 'The sandwich was built like it had a deadline and a dream.'),
    ('food', 'The noodles got tangled', 'The noodles formed a support group halfway through dinner.'),
    ('food', 'The spoon was efficient', 'The spoon got straight to the point, unlike the fork that kept poking around.'),
    ('food', 'The jam had issues', 'The jam was sweet, sticky, and definitely not ready for a commitment.'),
    ('food', 'The bread was supportive', 'The bread held everything together, which is more than some meetings can say.'),
    ('food', 'The cookie jar was optimistic', 'The cookie jar always believed there would be enough left for later.'),
    ('food', 'The salad spinner was going through it', 'The salad spinner was very energetic for something so aggressively unnecessary.'),
    ('random', 'The remote control had range', 'The remote control had the power to change channels and family dynamics.'),
    ('random', 'The bottle opener was a team player', 'The bottle opener only gets praise when things are already about to improve.'),
    ('random', 'The raincoat was overprepared', 'The raincoat expected a storm and probably an apology.'),
    ('random', 'The backpack zipper quit early', 'The backpack zipper gave up halfway through the semester and never recovered.'),
    ('random', 'The sunglasses had a secret', 'The sunglasses only act cool because they hide how bright the world is.'),
    ('random', 'The fan was all about circulation', 'The fan always brings movement to the room, even when the conversation is stuck.'),
    ('random', 'The notebook had perfect handwriting', 'The notebook looked organized enough to make everyone else feel underdressed.'),
    ('random', 'The staircase was ambitious', 'The staircase always believed in taking things one step at a time.'),
    ('random', 'The magnet had an attraction problem', 'The magnet could not help pulling in every bad decision within range.'),
    ('random', 'The pillow was emotionally available', 'The pillow never judged, which is why it got promoted to permanent support.')
  ) as t(slug, title_prefix, body)
), variants as (
  select * from (values
    ('A', 'on a Monday when nobody was laughing yet'),
    ('B', 'during a lunch break that should have been shorter')
  ) as v(tag, suffix)
), generated_jokes as (
  select
    (jt.title_prefix || ' ' || v.tag) as title,
    (jt.body || ' ' || v.suffix) as content,
    categories.id as category_id,
    now() - ((row_number() over (order by jt.slug, jt.title_prefix, v.tag)) * interval '1 hour') as created_at,
    now() - ((row_number() over (order by jt.slug, jt.title_prefix, v.tag)) * interval '1 hour') as updated_at
  from joke_templates jt
  join variants v on true
  join public.joke_categories categories on categories.slug = jt.slug
), inserted_jokes as (
  insert into public.jokes (title, content, category_id, status, created_at, updated_at)
  select
    generated_jokes.title,
    generated_jokes.content,
    generated_jokes.category_id,
    'approved',
    generated_jokes.created_at,
    generated_jokes.updated_at
  from generated_jokes
  where not exists (
    select 1
    from public.jokes existing
    where existing.title = generated_jokes.title
  )
  returning id, title
)
select count(*) as inserted_approved_jokes from inserted_jokes;

insert into public.jokes (title, content, category_id, status, created_at, updated_at)
select
  'Meeting notes for tomorrow',
  'The meeting had so many action items that the notebook asked for a promotion.',
  categories.id,
  'pending',
  now() - interval '3 hours',
  now() - interval '3 hours'
from public.joke_categories categories
where categories.slug = 'office'
and not exists (
  select 1
  from public.jokes existing
  where existing.title = 'Meeting notes for tomorrow'
);

insert into public.joke_edit_suggestions (joke_id, suggested_title, suggested_content, status, created_at)
select
  joke.id,
  'Meeting notes after overtime',
  'The meeting had so many action items that even the notebook requested a coffee break.',
  'pending',
  now() - interval '2 hours'
from public.jokes joke
where joke.title = 'Meeting notes for tomorrow'
and not exists (
  select 1
  from public.joke_edit_suggestions suggestion
  where suggestion.suggested_title = 'Meeting notes after overtime'
);
