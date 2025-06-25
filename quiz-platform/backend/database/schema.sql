
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  host_id INT NOT NULL,
  status ENUM('waiting', 'active', 'completed') DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES users(id)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answer options table
CREATE TABLE IF NOT EXISTS answer_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Room participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  score INT DEFAULT 0,
  status ENUM('active', 'left') DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Room questions table
CREATE TABLE IF NOT EXISTS room_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  question_id INT NOT NULL,
  status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
  start_time TIMESTAMP NULL,
  end_time TIMESTAMP NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_question_id INT NOT NULL,
  user_id INT NOT NULL,
  answer_option_id INT,
  is_correct BOOLEAN DEFAULT FALSE,
  response_time INT, -- in milliseconds
  points INT DEFAULT 0,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_question_id) REFERENCES room_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (answer_option_id) REFERENCES answer_options(id)
);

-- -- Create sample questions and answers
-- INSERT INTO questions (question_text, correct_answer, category, difficulty)
-- VALUES 
-- ('What is the capital of France?', 'Paris', 'Geography', 'easy'),
-- ('Which planet is known as the Red Planet?', 'Mars', 'Science', 'easy'),
-- ('Who painted the Mona Lisa?', 'Leonardo da Vinci', 'Art', 'medium'),
-- ('What is the largest ocean on Earth?', 'Pacific Ocean', 'Geography', 'medium'),
-- ('What is the chemical symbol for gold?', 'Au', 'Science', 'medium');

-- -- Add answer options for the first question (What is the capital of France?)
-- INSERT INTO answer_options (question_id, option_text, is_correct)
-- VALUES 
-- (1, 'Paris', TRUE),
-- (1, 'London', FALSE),
-- (1, 'Berlin', FALSE),
-- (1, 'Rome', FALSE);

-- -- Add answer options for the second question (Which planet is known as the Red Planet?)
-- INSERT INTO answer_options (question_id, option_text, is_correct)
-- VALUES 
-- (2, 'Venus', FALSE),
-- (2, 'Mars', TRUE),
-- (2, 'Jupiter', FALSE),
-- (2, 'Mercury', FALSE);

-- -- Add answer options for the third question (Who painted the Mona Lisa?)
-- INSERT INTO answer_options (question_id, option_text, is_correct)
-- VALUES 
-- (3, 'Pablo Picasso', FALSE),
-- (3, 'Vincent van Gogh', FALSE),
-- (3, 'Leonardo da Vinci', TRUE),
-- (3, 'Michelangelo', FALSE);

-- Add answer options for the fourth question (What is the largest ocean on Earth?)
-- INSERT INTO answer_options (question_id, option_text, is_correct)
-- VALUES 
-- (4, 'Atlantic Ocean', FALSE),
-- (4, 'Indian Ocean', FALSE),
-- (4, 'Arctic Ocean', FALSE),
-- (4, 'Pacific Ocean', TRUE);

-- -- Add answer options for the fifth question (What is the chemical symbol for gold?)
-- INSERT INTO answer_options (question_id, option_text, is_correct)
-- VALUES 
-- (5, 'Go', FALSE),
-- (5, 'Gd', FALSE),
-- (5, 'Au', TRUE),
-- (5, 'Ag', FALSE);


-- Insert 90 questions into questions table (30 per category, 10 per difficulty)
INSERT INTO questions (question_text, correct_answer, category, difficulty) VALUES
-- Geography - Easy
('What is the capital of France?', 'Paris', 'Geography', 'easy'),
('Which country is known for the Great Wall?', 'China', 'Geography', 'easy'),
('Which continent is Egypt in?', 'Africa', 'Geography', 'easy'),
('What ocean lies on the east coast of the United States?', 'Atlantic Ocean', 'Geography', 'easy'),
('What is the capital of Japan?', 'Tokyo', 'Geography', 'easy'),
('Which country is shaped like a boot?', 'Italy', 'Geography', 'easy'),
('What is the capital of India?', 'New Delhi', 'Geography', 'easy'),
('Which river flows through Egypt?', 'Nile', 'Geography', 'easy'),
('What is the tallest mountain in the world?', 'Mount Everest', 'Geography', 'easy'),
('Which desert covers much of northern Africa?', 'Sahara', 'Geography', 'easy'),

-- Geography - Medium
('Which US state has the most active volcanoes?', 'Alaska', 'Geography', 'medium'),
('Which city is known as the "City of Canals"?', 'Venice', 'Geography', 'medium'),
('Which line divides Earth into Northern and Southern hemispheres?', 'Equator', 'Geography', 'medium'),
('Which country has the most islands?', 'Sweden', 'Geography', 'medium'),
('Which European river is the longest?', 'Volga', 'Geography', 'medium'),
('What is the capital city of Canada?', 'Ottawa', 'Geography', 'medium'),
('Which mountain range separates Europe from Asia?', 'Ural Mountains', 'Geography', 'medium'),
('What is the largest country in South America?', 'Brazil', 'Geography', 'medium'),
('Which ocean surrounds the Maldives?', 'Indian Ocean', 'Geography', 'medium'),
('What is the capital of South Korea?', 'Seoul', 'Geography', 'medium'),

-- Geography - Hard
('Which is the deepest point on Earth?', 'Mariana Trench', 'Geography', 'hard'),
('What is the smallest independent country in the world?', 'Vatican City', 'Geography', 'hard'),
('Which African country has the most pyramids?', 'Sudan', 'Geography', 'hard'),
('Which country has the most time zones?', 'France', 'Geography', 'hard'),
('What country does the Danube River NOT flow through: Austria, Germany, Poland, or Romania?', 'Poland', 'Geography', 'hard'),
('Which sea has no coastline?', 'Sargasso Sea', 'Geography', 'hard'),
('What is the capital of Mongolia?', 'Ulaanbaatar', 'Geography', 'hard'),
('Which US state is furthest north?', 'Alaska', 'Geography', 'hard'),
('What is the longest river in Asia?', 'Yangtze River', 'Geography', 'hard'),
('Which country is home to the ancient city of Petra?', 'Jordan', 'Geography', 'hard'),

-- Science - Easy
('What planet do we live on?', 'Earth', 'Science', 'easy'),
('Which planet is known as the Red Planet?', 'Mars', 'Science', 'easy'),
('What gas do plants breathe in?', 'Carbon Dioxide', 'Science', 'easy'),
('How many legs does an insect have?', '6', 'Science', 'easy'),
('What do bees produce?', 'Honey', 'Science', 'easy'),
('What force keeps us on the ground?', 'Gravity', 'Science', 'easy'),
('What is H2O commonly known as?', 'Water', 'Science', 'easy'),
('What do you call animals that eat only plants?', 'Herbivores', 'Science', 'easy'),
('Which organ pumps blood in the human body?', 'Heart', 'Science', 'easy'),
('Which part of the plant absorbs water?', 'Roots', 'Science', 'easy'),

-- Science - Medium
('What gas do humans breathe in to survive?', 'Oxygen', 'Science', 'medium'),
('What is the center of an atom called?', 'Nucleus', 'Science', 'medium'),
('What is the chemical symbol for gold?', 'Au', 'Science', 'medium'),
('What part of the cell contains DNA?', 'Nucleus', 'Science', 'medium'),
('What is the largest planet in our solar system?', 'Jupiter', 'Science', 'medium'),
('What is the process of water changing to vapor called?', 'Evaporation', 'Science', 'medium'),
('Which planet has rings?', 'Saturn', 'Science', 'medium'),
('What is the boiling point of water in Celsius?', '100', 'Science', 'medium'),
('Which vitamin do we get from sunlight?', 'Vitamin D', 'Science', 'medium'),
('What does a thermometer measure?', 'Temperature', 'Science', 'medium'),

-- Science - Hard
('What is the powerhouse of the cell?', 'Mitochondria', 'Science', 'hard'),
('Which element has the highest atomic number?', 'Oganesson', 'Science', 'hard'),
('What is the second most abundant element in the Earth’s crust?', 'Silicon', 'Science', 'hard'),
('Which particle carries a negative charge?', 'Electron', 'Science', 'hard'),
('What is the most reactive group of nonmetals?', 'Halogens', 'Science', 'hard'),
('What is the unit of electrical resistance?', 'Ohm', 'Science', 'hard'),
('What law states that for every action, there is an equal and opposite reaction?', 'Newtons Third Law', 'Science', 'hard'),
('What is the chemical formula of table salt?', 'NaCl', 'Science', 'hard'),
('What is the term for animals active during the night?', 'Nocturnal', 'Science', 'hard'),
('What is the longest bone in the human body?', 'Femur', 'Science', 'hard'),

-- Math - Easy
('What is 2 + 2?', '4', 'Math', 'easy'),
('What is 10 - 4?', '6', 'Math', 'easy'),
('What is 5 x 3?', '15', 'Math', 'easy'),
('What is 12/4?', '3', 'Math', 'easy'),
('What is the square of 2?', '4', 'Math', 'easy'),
('What is 7 + 6?', '13', 'Math', 'easy'),
('How many sides does a triangle have?', '3', 'Math', 'easy'),
('What is the result of 100 - 99?', '1', 'Math', 'easy'),
('What is half of 20?', '10', 'Math', 'easy'),
('What comes after the number 9?', '10', 'Math', 'easy'),

-- Math - Medium
('What is the value of pi up to 2 decimal places?', '3.14', 'Math', 'medium'),
('What is 12% of 50?', '6', 'Math', 'medium'),
('What is 8 squared?', '64', 'Math', 'medium'),
('What is the square root of 144?', '12', 'Math', 'medium'),
('What is the perimeter of a square with side 4?', '16', 'Math', 'medium'),
('What is 3/4 + 1/4?', '1', 'Math', 'medium'),
('What is 45/5?', '9', 'Math', 'medium'),
('How many degrees in a right angle?', '90', 'Math', 'medium'),
('What is 25 x 4?', '100', 'Math', 'medium'),
('What is the area of a rectangle with length 5 and width 2?', '10', 'Math', 'medium'),

-- Math - Hard
('What is the derivative of x^2?', '2x', 'Math', 'hard'),
('What is the integral of 2x dx?', 'x^2 + C', 'Math', 'hard'),
('What is 2 to the power of 10?', '1024', 'Math', 'hard'),
('What is the value of sin(90°)?', '1', 'Math', 'hard'),
('What is 7 factorial (7!)?', '5040', 'Math', 'hard'),
('Solve: If x + 3 = 10, what is x?', '7', 'Math', 'hard'),
('What is the square root of 625?', '25', 'Math', 'hard'),
('What is the log base 10 of 1000?', '3', 'Math', 'hard'),
('What is the sum of angles in a triangle?', '180', 'Math', 'hard'),
('What is the formula for the area of a circle?', 'πr^2', 'Math', 'hard');


INSERT INTO answer_options (question_id, option_text, is_correct) VALUES
-- Geography - Easy
(1, 'Paris', TRUE),
(1, 'London', FALSE),
(1, 'Berlin', FALSE),
(1, 'Madrid', FALSE),

(2, 'China', TRUE),
(2, 'India', FALSE),
(2, 'Japan', FALSE),
(2, 'Egypt', FALSE),

(3, 'Africa', TRUE),
(3, 'Asia', FALSE),
(3, 'Europe', FALSE),
(3, 'Australia', FALSE),

(4, 'Atlantic Ocean', TRUE),
(4, 'Pacific Ocean', FALSE),
(4, 'Indian Ocean', FALSE),
(4, 'Arctic Ocean', FALSE),

(5, 'Tokyo', TRUE),
(5, 'Kyoto', FALSE),
(5, 'Beijing', FALSE),
(5, 'Seoul', FALSE),

(6, 'Italy', TRUE),
(6, 'Spain', FALSE),
(6, 'Greece', FALSE),
(6, 'France', FALSE),

(7, 'New Delhi', TRUE),
(7, 'Mumbai', FALSE),
(7, 'Kolkata', FALSE),
(7, 'Chennai', FALSE),

(8, 'Nile', TRUE),
(8, 'Amazon', FALSE),
(8, 'Yangtze', FALSE),
(8, 'Mississippi', FALSE),

(9, 'Mount Everest', TRUE),
(9, 'K2', FALSE),
(9, 'Kangchenjunga', FALSE),
(9, 'Lhotse', FALSE),

(10, 'Sahara', TRUE),
(10, 'Gobi', FALSE),
(10, 'Kalahari', FALSE),
(10, 'Arabian', FALSE),

-- Geography - Medium
(11, 'Alaska', TRUE),
(11, 'Hawaii', FALSE),
(11, 'California', FALSE),
(11, 'Washington', FALSE),

(12, 'Venice', TRUE),
(12, 'Amsterdam', FALSE),
(12, 'Bangkok', FALSE),
(12, 'Bruges', FALSE),

(13, 'Equator', TRUE),
(13, 'Prime Meridian', FALSE),
(13, 'Tropic of Cancer', FALSE),
(13, 'International Date Line', FALSE),

(14, 'Sweden', TRUE),
(14, 'Indonesia', FALSE),
(14, 'Philippines', FALSE),
(14, 'Canada', FALSE),

(15, 'Volga', TRUE),
(15, 'Danube', FALSE),
(15, 'Rhine', FALSE),
(15, 'Seine', FALSE),

(16, 'Ottawa', TRUE),
(16, 'Toronto', FALSE),
(16, 'Vancouver', FALSE),
(16, 'Montreal', FALSE),

(17, 'Ural Mountains', TRUE),
(17, 'Alps', FALSE),
(17, 'Carpathians', FALSE),
(17, 'Pyrenees', FALSE),

(18, 'Brazil', TRUE),
(18, 'Argentina', FALSE),
(18, 'Colombia', FALSE),
(18, 'Peru', FALSE),

(19, 'Indian Ocean', TRUE),
(19, 'Pacific Ocean', FALSE),
(19, 'Atlantic Ocean', FALSE),
(19, 'Arctic Ocean', FALSE),

(20, 'Seoul', TRUE),
(20, 'Busan', FALSE),
(20, 'Tokyo', FALSE),
(20, 'Pyongyang', FALSE),

-- Geography - Hard
(21, 'Mariana Trench', TRUE),
(21, 'Tonga Trench', FALSE),
(21, 'Puerto Rico Trench', FALSE),
(21, 'Java Trench', FALSE),

(22, 'Vatican City', TRUE),
(22, 'Monaco', FALSE),
(22, 'Nauru', FALSE),
(22, 'San Marino', FALSE),

(23, 'Sudan', TRUE),
(23, 'Egypt', FALSE),
(23, 'Libya', FALSE),
(23, 'Ethiopia', FALSE),

(24, 'France', TRUE),
(24, 'Russia', FALSE),
(24, 'USA', FALSE),
(24, 'China', FALSE),

(25, 'Poland', TRUE),
(25, 'Austria', FALSE),
(25, 'Germany', FALSE),
(25, 'Romania', FALSE),

(26, 'Sargasso Sea', TRUE),
(26, 'Red Sea', FALSE),
(26, 'Baltic Sea', FALSE),
(26, 'Caspian Sea', FALSE),

(27, 'Ulaanbaatar', TRUE),
(27, 'Astana', FALSE),
(27, 'Tashkent', FALSE),
(27, 'Bishkek', FALSE),

(28, 'Alaska', TRUE),
(28, 'Maine', FALSE),
(28, 'Minnesota', FALSE),
(28, 'Washington', FALSE),

(29, 'Yangtze River', TRUE),
(29, 'Yellow River', FALSE),
(29, 'Mekong', FALSE),
(29, 'Ganges', FALSE),

(30, 'Jordan', TRUE),
(30, 'Syria', FALSE),
(30, 'Egypt', FALSE),
(30, 'Lebanon', FALSE),

-- Science - Easy
(31, 'Earth', TRUE),
(31, 'Mars', FALSE),
(31, 'Venus', FALSE),
(31, 'Jupiter', FALSE),

(32, 'Mars', TRUE),
(32, 'Jupiter', FALSE),
(32, 'Saturn', FALSE),
(32, 'Mercury', FALSE),

(33, 'Carbon Dioxide', TRUE),
(33, 'Oxygen', FALSE),
(33, 'Nitrogen', FALSE),
(33, 'Hydrogen', FALSE),

(34, '6', TRUE),
(34, '8', FALSE),
(34, '4', FALSE),
(34, '10', FALSE),

(35, 'Honey', TRUE),
(35, 'Milk', FALSE),
(35, 'Silk', FALSE),
(35, 'Wax', FALSE),

(36, 'Gravity', TRUE),
(36, 'Magnetism', FALSE),
(36, 'Friction', FALSE),
(36, 'Electricity', FALSE),

(37, 'Water', TRUE),
(37, 'Oxygen', FALSE),
(37, 'Salt', FALSE),
(37, 'Hydrogen', FALSE),

(38, 'Herbivores', TRUE),
(38, 'Carnivores', FALSE),
(38, 'Omnivores', FALSE),
(38, 'Insectivores', FALSE),

(39, 'Heart', TRUE),
(39, 'Liver', FALSE),
(39, 'Lungs', FALSE),
(39, 'Kidney', FALSE),

(40, 'Roots', TRUE),
(40, 'Leaves', FALSE),
(40, 'Stem', FALSE),
(40, 'Flower', FALSE),

-- Science - Medium
(41, 'Oxygen', TRUE),
(41, 'Carbon Dioxide', FALSE),
(41, 'Nitrogen', FALSE),
(41, 'Hydrogen', FALSE),

(42, 'Nucleus', TRUE),
(42, 'Electron', FALSE),
(42, 'Proton', FALSE),
(42, 'Neutron', FALSE),

(43, 'Au', TRUE),
(43, 'Ag', FALSE),
(43, 'Fe', FALSE),
(43, 'Pb', FALSE),

(44, 'Nucleus', TRUE),
(44, 'Cytoplasm', FALSE),
(44, 'Cell wall', FALSE),
(44, 'Ribosome', FALSE),

(45, 'Jupiter', TRUE),
(45, 'Saturn', FALSE),
(45, 'Neptune', FALSE),
(45, 'Earth', FALSE),

(46, 'Evaporation', TRUE),
(46, 'Condensation', FALSE),
(46, 'Precipitation', FALSE),
(46, 'Sublimation', FALSE),

(47, 'Saturn', TRUE),
(47, 'Mars', FALSE),
(47, 'Venus', FALSE),
(47, 'Mercury', FALSE),

(48, '100', TRUE),
(48, '0', FALSE),
(48, '50', FALSE),
(48, '212', FALSE),

(49, 'Vitamin D', TRUE),
(49, 'Vitamin C', FALSE),
(49, 'Vitamin B', FALSE),
(49, 'Vitamin A', FALSE),

(50, 'Temperature', TRUE),
(50, 'Pressure', FALSE),
(50, 'Humidity', FALSE),
(50, 'Speed', FALSE),

-- Science - Hard
(51, 'Mitochondria', TRUE),
(51, 'Nucleus', FALSE),
(51, 'Ribosome', FALSE),
(51, 'Chloroplast', FALSE),

(52, 'Oganesson', TRUE),
(52, 'Uranium', FALSE),
(52, 'Plutonium', FALSE),
(52, 'Lead', FALSE),

(53, 'Silicon', TRUE),
(53, 'Oxygen', FALSE),
(53, 'Aluminum', FALSE),
(53, 'Iron', FALSE),

(54, 'Electron', TRUE),
(54, 'Proton', FALSE),
(54, 'Neutron', FALSE),
(54, 'Photon', FALSE),

(55, 'Halogens', TRUE),
(55, 'Noble gases', FALSE),
(55, 'Alkali metals', FALSE),
(55, 'Transition metals', FALSE),

(56, 'Ohm', TRUE),
(56, 'Ampere', FALSE),
(56, 'Volt', FALSE),
(56, 'Watt', FALSE),

(57, 'Newtons Third Law', TRUE),
(57, 'Newtons First Law', FALSE),
(57, 'Newtons Second Law', FALSE),
(57, 'Law of Gravity', FALSE),

(58, 'NaCl', TRUE),
(58, 'KCl', FALSE),
(58, 'Na2CO3', FALSE),
(58, 'CaCl2', FALSE),

(59, 'Nocturnal', TRUE),
(59, 'Diurnal', FALSE),
(59, 'Crepuscular', FALSE),
(59, 'Aquatic', FALSE),

(60, 'Femur', TRUE),
(60, 'Tibia', FALSE),
(60, 'Humerus', FALSE),
(60, 'Fibula', FALSE),

-- Math - Easy
(61, '4', TRUE),
(61, '2', FALSE),
(61, '6', FALSE),
(61, '8', FALSE),

(62, '6', TRUE),
(62, '4', FALSE),
(62, '8', FALSE),
(62, '10', FALSE),

(63, '15', TRUE),
(63, '8', FALSE),
(63, '10', FALSE),
(63, '12', FALSE),

(64, '3', TRUE),
(64, '4', FALSE),
(64, '6', FALSE),
(64, '2', FALSE),

(65, '4', TRUE),
(65, '2', FALSE),
(65, '8', FALSE),
(65, '16', FALSE),

(66, '13', TRUE),
(66, '12', FALSE),
(66, '14', FALSE),
(66, '15', FALSE),

(67, '3', TRUE),
(67, '4', FALSE),
(67, '5', FALSE),
(67, '6', FALSE),

(68, '1', TRUE),
(68, '2', FALSE),
(68, '0', FALSE),
(68, '3', FALSE),

(69, '10', TRUE),
(69, '5', FALSE),
(69, '20', FALSE),
(69, '15', FALSE),

(70, '10', TRUE),
(70, '11', FALSE),
(70, '9', FALSE),
(70, '12', FALSE),

-- Math - Medium
(71, '3.14', TRUE),
(71, '2.71', FALSE),
(71, '1.61', FALSE),
(71, '3.41', FALSE),

(72, '6', TRUE),
(72, '12', FALSE),
(72, '3', FALSE),
(72, '8', FALSE),

(73, '64', TRUE),
(73, '16', FALSE),
(73, '32', FALSE),
(73, '8', FALSE),

(74, '12', TRUE),
(74, '14', FALSE),
(74, '10', FALSE),
(74, '16', FALSE),

(75, '16', TRUE),
(75, '8', FALSE),
(75, '12', FALSE),
(75, '20', FALSE),

(76, '1', TRUE),
(76, '1/2', FALSE),
(76, '2', FALSE),
(76, '3/4', FALSE),

(77, '9', TRUE),
(77, '8', FALSE),
(77, '7', FALSE),
(77, '6', FALSE),

(78, '90', TRUE),
(78, '60', FALSE),
(78, '120', FALSE),
(78, '180', FALSE),

(79, '100', TRUE),
(79, '50', FALSE),
(79, '25', FALSE),
(79, '75', FALSE),

(80, '10', TRUE),
(80, '7', FALSE),
(80, '12', FALSE),
(80, '14', FALSE),

-- Math - Hard
(81, '2x', TRUE),
(81, 'x^2', FALSE),
(81, 'x', FALSE),
(81, '2', FALSE),

(82, 'x^2 + C', TRUE),
(82, '2x + C', FALSE),
(82, 'x^3 + C', FALSE),
(82, 'x^2', FALSE),

(83, '1024', TRUE),
(83, '512', FALSE),
(83, '2048', FALSE),
(83, '1000', FALSE),

(84, '1', TRUE),
(84, '0', FALSE),
(84, '-1', FALSE),
(84, '0.5', FALSE),

(85, '5040', TRUE),
(85, '720', FALSE),
(85, '120', FALSE),
(85, '40320', FALSE),

(86, '7', TRUE),
(86, '3', FALSE),
(86, '10', FALSE),
(86, '13', FALSE),

(87, '25', TRUE),
(87, '20', FALSE),
(87, '15', FALSE),
(87, '30', FALSE),

(88, '3', TRUE),
(88, '2', FALSE),
(88, '1', FALSE),
(88, '10', FALSE),

(89, '180', TRUE),
(89, '90', FALSE),
(89, '360', FALSE),
(89, '270', FALSE),

(90, 'πr^2', TRUE),
(90, '2πr', FALSE),
(90, 'πd', FALSE),
(90, 'r^2', FALSE);

ALTER TABLE rooms
ADD COLUMN question_count INT DEFAULT 5,
ADD COLUMN difficulties VARCHAR(100) DEFAULT 'easy,medium,hard',
ADD COLUMN categories VARCHAR(100) DEFAULT 'Geography,Science,Math',
ADD COLUMN time_per_question INT DEFAULT 10;
