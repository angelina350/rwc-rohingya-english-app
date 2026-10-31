// All content below is MOCK and unvalidated. Rohingya strings are placeholders,
// not verified translations (see README: data must be marked unvalidated).
import type { Category, QuickPhrase, Scenario, ScenarioTurn, Word } from './types';

// Ids follow the backend spec's categories (+ greetings; Daily Life and Family are on hold).
export const categories: Category[] = [
  { id: 'healthcare', name: 'Healthcare', description: 'Hospitals, clinics, appointments' },
  { id: 'education', name: 'Education', description: 'School, teachers, homework' },
  { id: 'housing', name: 'Housing', description: 'Finding a home, rent, repairs' },
  { id: 'greetings', name: 'Greetings', description: 'Hello, thank you, saying goodbye' },
  { id: 'transportation', name: 'Transportation', description: 'Bus, tickets, directions' },
  { id: 'employment', name: 'Employment', description: 'Jobs, schedules, workplace' },
];

const w = (id: string, categoryId: string, english: string, rohingyalish: string | null): Word => ({
  id,
  categoryId,
  english,
  rohingyalish,
  rohingya: null,
  imageUrl: null,
  audioUrl: null,
  verification: 'unvalidated',
});

export const words: Word[] = [
  w('word_001', 'healthcare', 'Doctor', '[mock] dakhtor'),
  w('word_002', 'healthcare', 'Hospital', '[mock] haspatal'),
  w('word_003', 'healthcare', 'Medicine', '[mock] oshud'),
  w('word_004', 'greetings', 'Hello', '[mock] salam'),
  w('word_005', 'greetings', 'Thank you', '[mock] shukria'),
  w('word_006', 'greetings', 'Goodbye', null),
  w('word_007', 'transportation', 'Bus', '[mock] bas'),
  w('word_008', 'transportation', 'Ticket', null),
  w('word_009', 'employment', 'Job', '[mock] kam'),
  w('word_010', 'employment', 'Boss', null),
  w('word_013', 'education', 'School', '[mock] iskul'),
  w('word_014', 'education', 'Teacher', null),
  w('word_015', 'housing', 'Rent', null),
  w('word_016', 'housing', 'Apartment', null),
  w('word_017', 'greetings', 'Good morning', null),
  w('word_018', 'greetings', 'Good evening', null),
  w('word_019', 'greetings', 'Please', null),
  w('word_020', 'greetings', 'Sorry', null),
  w('word_021', 'greetings', 'How are you?', null),
  w('word_022', 'greetings', 'Nice to meet you', null),
];

const phrase = (id: string, categoryId: string, english: string): QuickPhrase => ({
  id,
  categoryId,
  english,
  rohingyalish: null,
  rohingya: null,
  audioUrl: null,
});

export const quickPhrases: QuickPhrase[] = [
  phrase('phrase_healthcare_001', 'healthcare', 'I need to see a doctor.'),
  phrase('phrase_healthcare_002', 'healthcare', 'Where is the nearest hospital?'),
  phrase('phrase_healthcare_003', 'healthcare', 'I need some medicine.'),
  phrase('phrase_education_001', 'education', 'Where is the school office?'),
  phrase('phrase_education_002', 'education', 'I would like to speak with the teacher.'),
  phrase('phrase_education_003', 'education', 'When does school start?'),
  phrase('phrase_housing_001', 'housing', 'Is this apartment available?'),
  phrase('phrase_housing_002', 'housing', 'How much is the rent?'),
  phrase('phrase_housing_003', 'housing', 'Something needs to be repaired.'),
  phrase('phrase_greetings_001', 'greetings', 'Hello, how are you?'),
  phrase('phrase_greetings_002', 'greetings', 'Thank you very much.'),
  phrase('phrase_greetings_003', 'greetings', 'It was nice to meet you.'),
  phrase('phrase_transportation_001', 'transportation', 'Where can I catch the bus?'),
  phrase('phrase_transportation_002', 'transportation', 'I need a ticket to the city center.'),
  phrase('phrase_transportation_003', 'transportation', 'How long does the trip take?'),
  phrase('phrase_employment_001', 'employment', 'I am looking for a job.'),
  phrase('phrase_employment_002', 'employment', 'What time does my shift start?'),
  phrase('phrase_employment_003', 'employment', 'Where should I submit my application?'),
];

const partner = (id: string, text: string): ScenarioTurn => ({ id, role: 'partner', text });
const s = (id: string, categoryId: string, title: string, lines: string[]): Scenario => ({
  id,
  categoryId,
  title,
  turns: lines.map((text, i) => partner(`${id}_t${i}`, text)),
});

// Prompts are English-only; the learner answers aloud.
export const scenarios: Scenario[] = [
  s('doctor_visit', 'healthcare', 'At the doctor', [
    'Hello! How can I help you today?',
    'Where does it hurt?',
    'How long have you felt this way?',
  ]),
  s('pharmacy', 'healthcare', 'At the pharmacy', [
    'Hi, do you have a prescription?',
    'Do you have any allergies?',
  ]),
  s('school_registration', 'education', 'Registering your child', [
    'Welcome! What is your child’s name?',
    'How old is your child?',
    'Do you have the vaccination record?',
  ]),
  s('rent_apartment', 'housing', 'Asking about rent', [
    'This apartment is available. Are you interested?',
    'The rent is $1,200 a month. Is that okay?',
  ]),
  s('meet_neighbour', 'greetings', 'Meeting a neighbour', [
    'Hello! I’m your new neighbour.',
    'How are you today?',
    'Nice to meet you. Welcome!',
  ]),
  s('say_goodbye', 'greetings', 'Saying goodbye', [
    'It was nice talking to you.',
    'Have a good day. Goodbye!',
  ]),
  s('bus_ticket', 'transportation', 'Buying a bus ticket', [
    'Where would you like to go?',
    'One way or return?',
  ]),
  s('job_interview', 'employment', 'Job interview', [
    'Thanks for coming. Tell me about yourself.',
    'What kind of work have you done before?',
    'When can you start?',
  ]),
];

export const mockTranslations: Record<string, string> = {
  'en-rhg': '[mock] Rohingya translation',
  'rhg-en': 'I need to see a doctor.',
};

export const mockOcrText = 'Where is the nearest clinic?';
