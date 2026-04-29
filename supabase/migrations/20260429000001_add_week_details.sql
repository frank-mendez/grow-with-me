alter table pregnancy_weeks
  add column baby_size   text,
  add column trimester   text,
  add column approx_size text,
  add column just_for_you text;

update pregnancy_weeks set baby_size = 'Poppy Seed',        trimester = '1st Trimester', approx_size = '~0.1 mm',  just_for_you = 'Your journey begins. Take it slow and be kind to yourself.' where week_number = 1;
update pregnancy_weeks set baby_size = 'Poppy Seed',        trimester = '1st Trimester', approx_size = '~0.1 mm',  just_for_you = 'Your body is doing something amazing already.' where week_number = 2;
update pregnancy_weeks set baby_size = 'Sesame Seed',       trimester = '1st Trimester', approx_size = '~0.2 mm',  just_for_you = 'Tiny beginnings often lead to the greatest miracles.' where week_number = 3;
update pregnancy_weeks set baby_size = 'Lentil',            trimester = '1st Trimester', approx_size = '~1 mm',    just_for_you = 'Everything is starting to take shape—rest well.' where week_number = 4;
update pregnancy_weeks set baby_size = 'Blueberry',         trimester = '1st Trimester', approx_size = '~2 mm',    just_for_you = 'You might not see it yet, but something beautiful is growing.' where week_number = 5;
update pregnancy_weeks set baby_size = 'Sweet Pea',         trimester = '1st Trimester', approx_size = '~4 mm',    just_for_you = 'Listen to your body—it knows exactly what to do.' where week_number = 6;
update pregnancy_weeks set baby_size = 'Blueberry',         trimester = '1st Trimester', approx_size = '~1 cm',    just_for_you = 'You''re nurturing life. That''s powerful.' where week_number = 7;
update pregnancy_weeks set baby_size = 'Kidney Bean',       trimester = '1st Trimester', approx_size = '~1.6 cm',  just_for_you = 'Take a deep breath—you''re doing great.' where week_number = 8;
update pregnancy_weeks set baby_size = 'Grape',             trimester = '1st Trimester', approx_size = '~2.3 cm',  just_for_you = 'Every week is a new little milestone.' where week_number = 9;
update pregnancy_weeks set baby_size = 'Strawberry',        trimester = '1st Trimester', approx_size = '~3 cm',    just_for_you = 'You''re stronger than you think.' where week_number = 10;
update pregnancy_weeks set baby_size = 'Lime',              trimester = '1st Trimester', approx_size = '~4 cm',    just_for_you = 'Little by little, everything is coming together.' where week_number = 11;
update pregnancy_weeks set baby_size = 'Plum',              trimester = '1st Trimester', approx_size = '~5.5 cm',  just_for_you = 'You made it through the first trimester—amazing.' where week_number = 12;
update pregnancy_weeks set baby_size = 'Peach',             trimester = '2nd Trimester', approx_size = '~7 cm',    just_for_you = 'A new chapter begins—enjoy the energy boost.' where week_number = 13;
update pregnancy_weeks set baby_size = 'Lemon',             trimester = '2nd Trimester', approx_size = '~8.5 cm',  just_for_you = 'Things are getting more real now—how exciting.' where week_number = 14;
update pregnancy_weeks set baby_size = 'Apple',             trimester = '2nd Trimester', approx_size = '~10 cm',   just_for_you = 'You''re glowing in your own way.' where week_number = 15;
update pregnancy_weeks set baby_size = 'Avocado',           trimester = '2nd Trimester', approx_size = '~11.5 cm', just_for_you = 'Take moments to relax—you deserve it.' where week_number = 16;
update pregnancy_weeks set baby_size = 'Pear',              trimester = '2nd Trimester', approx_size = '~13 cm',   just_for_you = 'Your baby is growing fast—so are you.' where week_number = 17;
update pregnancy_weeks set baby_size = 'Sweet Potato',      trimester = '2nd Trimester', approx_size = '~14 cm',   just_for_you = 'Pause and appreciate how far you''ve come.' where week_number = 18;
update pregnancy_weeks set baby_size = 'Mango',             trimester = '2nd Trimester', approx_size = '~15 cm',   just_for_you = 'You''re creating life—never forget how incredible that is.' where week_number = 19;
update pregnancy_weeks set baby_size = 'Banana',            trimester = '2nd Trimester', approx_size = '~16 cm',   just_for_you = 'Halfway there—celebrate this moment.' where week_number = 20;
update pregnancy_weeks set baby_size = 'Carrot',            trimester = '2nd Trimester', approx_size = '~18 cm',   just_for_you = 'Your journey is unfolding beautifully.' where week_number = 21;
update pregnancy_weeks set baby_size = 'Spaghetti Squash',  trimester = '2nd Trimester', approx_size = '~19 cm',   just_for_you = 'Every day matters—take it one step at a time.' where week_number = 22;
update pregnancy_weeks set baby_size = 'Grapefruit',        trimester = '2nd Trimester', approx_size = '~20 cm',   just_for_you = 'You''re doing something extraordinary.' where week_number = 23;
update pregnancy_weeks set baby_size = 'Corn',              trimester = '2nd Trimester', approx_size = '~21 cm',   just_for_you = 'Your baby is thriving because of you.' where week_number = 24;
update pregnancy_weeks set baby_size = 'Rutabaga',          trimester = '2nd Trimester', approx_size = '~23 cm',   just_for_you = 'You''re stronger than every doubt.' where week_number = 25;
update pregnancy_weeks set baby_size = 'Scallion',          trimester = '2nd Trimester', approx_size = '~35 cm',   just_for_you = 'Trust your body—it''s doing its job.' where week_number = 26;
update pregnancy_weeks set baby_size = 'Cauliflower',       trimester = '3rd Trimester', approx_size = '~36 cm',   just_for_you = 'The final stretch begins—stay steady.' where week_number = 27;
update pregnancy_weeks set baby_size = 'Eggplant',          trimester = '3rd Trimester', approx_size = '~37 cm',   just_for_you = 'You''ve come so far—keep going.' where week_number = 28;
update pregnancy_weeks set baby_size = 'Butternut Squash',  trimester = '3rd Trimester', approx_size = '~38 cm',   just_for_you = 'Rest when you can—you''ve earned it.' where week_number = 29;
update pregnancy_weeks set baby_size = 'Cabbage',           trimester = '3rd Trimester', approx_size = '~39 cm',   just_for_you = 'Your strength is inspiring.' where week_number = 30;
update pregnancy_weeks set baby_size = 'Coconut',           trimester = '3rd Trimester', approx_size = '~41 cm',   just_for_you = 'You''re preparing for something life-changing.' where week_number = 31;
update pregnancy_weeks set baby_size = 'Jicama',            trimester = '3rd Trimester', approx_size = '~42 cm',   just_for_you = 'Almost there—take it day by day.' where week_number = 32;
update pregnancy_weeks set baby_size = 'Pineapple',         trimester = '3rd Trimester', approx_size = '~43 cm',   just_for_you = 'Your baby can feel your love already.' where week_number = 33;
update pregnancy_weeks set baby_size = 'Cantaloupe',        trimester = '3rd Trimester', approx_size = '~45 cm',   just_for_you = 'You''re doing better than you think.' where week_number = 34;
update pregnancy_weeks set baby_size = 'Honeydew',          trimester = '3rd Trimester', approx_size = '~46 cm',   just_for_you = 'Every moment now is precious.' where week_number = 35;
update pregnancy_weeks set baby_size = 'Romaine Lettuce',   trimester = '3rd Trimester', approx_size = '~47 cm',   just_for_you = 'You''re so close—stay strong.' where week_number = 36;
update pregnancy_weeks set baby_size = 'Swiss Chard',       trimester = '3rd Trimester', approx_size = '~48 cm',   just_for_you = 'Your journey is almost complete.' where week_number = 37;
update pregnancy_weeks set baby_size = 'Leek',              trimester = '3rd Trimester', approx_size = '~49 cm',   just_for_you = 'Take deep breaths—you''ve got this.' where week_number = 38;
update pregnancy_weeks set baby_size = 'Watermelon',        trimester = '3rd Trimester', approx_size = '~50 cm',   just_for_you = 'Any day now—how exciting.' where week_number = 39;
update pregnancy_weeks set baby_size = 'Small Pumpkin',     trimester = '3rd Trimester', approx_size = '~51 cm',   just_for_you = 'You did it. A new chapter is about to begin.' where week_number = 40;
