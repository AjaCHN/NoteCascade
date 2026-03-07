// app/lib/theory-lessons.ts v1.0.0

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface InteractiveElement {
  type: 'play-note' | 'play-chord' | 'identify-interval';
  instruction: string;
  targetMidi?: number[];
}

export interface TheoryLesson {
  id: string;
  title: string;
  content: string[];
  interactiveElement?: InteractiveElement;
  quiz: QuizQuestion[];
}

export const theoryLessons: TheoryLesson[] = [
  {
    id: 'intro-notes',
    title: '1. The Musical Alphabet',
    content: [
      'Music uses an alphabet of just seven letters: A, B, C, D, E, F, and G. These are the natural notes, represented by the white keys on a piano.',
      'After G, the alphabet starts over again at A. The distance between one note and the next note with the same name is called an octave.',
      'The black keys represent sharp (#) and flat (b) notes. A sharp raises a note by a half step, while a flat lowers it by a half step.',
      'For example, the black key immediately to the right of C is C# (C sharp). It is also immediately to the left of D, so it can also be called Db (D flat).'
    ],
    interactiveElement: {
      type: 'play-note',
      instruction: 'Try finding and playing Middle C (MIDI note 60) on your keyboard.',
      targetMidi: [60]
    },
    quiz: [
      {
        question: 'How many letters are in the musical alphabet?',
        options: ['5', '7', '12', '26'],
        correctAnswer: 1
      },
      {
        question: 'What is the distance between one C and the next C called?',
        options: ['A step', 'A chord', 'An octave', 'A scale'],
        correctAnswer: 2
      },
      {
        question: 'What does a sharp (#) do to a note?',
        options: ['Lowers it by a half step', 'Raises it by a half step', 'Makes it louder', 'Makes it longer'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'major-scale',
    title: '2. The Major Scale',
    content: [
      'A scale is a sequence of notes in ascending or descending order. The most common scale in Western music is the Major Scale.',
      'The Major Scale is built using a specific pattern of whole steps (W) and half steps (H). A half step is the distance from one key to the very next key (white or black). A whole step is two half steps.',
      'The pattern for a Major Scale is: W - W - H - W - W - W - H.',
      'If we start on C and follow this pattern, we play only white keys: C, D, E, F, G, A, B, C. This is the C Major Scale.'
    ],
    interactiveElement: {
      type: 'play-note',
      instruction: 'Play the C Major scale starting from Middle C (C4, D4, E4, F4, G4, A4, B4, C5).',
      targetMidi: [60, 62, 64, 65, 67, 69, 71, 72]
    },
    quiz: [
      {
        question: 'What is the pattern of whole (W) and half (H) steps for a Major Scale?',
        options: [
          'W - H - W - H - W - H - W',
          'W - W - H - W - W - W - H',
          'H - W - W - H - W - W - W',
          'W - W - W - H - W - W - H'
        ],
        correctAnswer: 1
      },
      {
        question: 'Which major scale uses only white keys on the piano?',
        options: ['G Major', 'F Major', 'C Major', 'D Major'],
        correctAnswer: 2
      },
      {
        question: 'How many half steps make up a whole step?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'basic-chords',
    title: '3. Basic Chords (Triads)',
    content: [
      'A chord is a group of three or more notes played together. The most basic type of chord is a triad, which consists of three notes.',
      'A triad is built by stacking thirds. In the C Major scale, if we start on C, skip D, play E, skip F, and play G, we get a C Major triad (C - E - G).',
      'The three notes of a triad are called the Root (the starting note), the Third, and the Fifth.',
      'Major chords sound "happy" or "bright", while minor chords sound "sad" or "dark". A minor chord is created by lowering the Third of a major chord by a half step.'
    ],
    interactiveElement: {
      type: 'play-chord',
      instruction: 'Play a C Major triad (C, E, G).',
      targetMidi: [60, 64, 67]
    },
    quiz: [
      {
        question: 'What is a chord with exactly three notes called?',
        options: ['A triad', 'A scale', 'An octave', 'An interval'],
        correctAnswer: 0
      },
      {
        question: 'What are the notes in a C Major triad?',
        options: ['C - D - E', 'C - F - G', 'C - E - G', 'C - Eb - G'],
        correctAnswer: 2
      },
      {
        question: 'How do you change a major chord into a minor chord?',
        options: [
          'Raise the root by a half step',
          'Lower the third by a half step',
          'Raise the fifth by a half step',
          'Play it an octave lower'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'intervals',
    title: '4. Understanding Intervals',
    content: [
      'An interval is the distance in pitch between two notes. They are the building blocks of melodies and chords.',
      'Intervals are named by their number (distance in scale degrees) and their quality (Major, Minor, Perfect, Augmented, Diminished).',
      'For example, the distance from C to the next D is a "Second". From C to E is a "Third". From C to G is a "Fifth".',
      'A Perfect Fifth (like C to G) is one of the most stable and common intervals in music, spanning 7 half steps.'
    ],
    quiz: [
      {
        question: 'What is an interval?',
        options: [
          'The speed of the music',
          'The distance in pitch between two notes',
          'A type of chord',
          'The loudness of a note'
        ],
        correctAnswer: 1
      },
      {
        question: 'What is the interval from C to G called?',
        options: ['A Second', 'A Third', 'A Fourth', 'A Fifth'],
        correctAnswer: 3
      },
      {
        question: 'How many half steps are in a Perfect Fifth?',
        options: ['4', '5', '7', '12'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'rhythm-basics',
    title: '5. Rhythm and Time Signatures',
    content: [
      'Rhythm is the placement of sounds in time. It determines when notes are played and how long they last.',
      'The beat is the steady pulse of the music. Notes are measured in relation to this beat.',
      'A Whole Note lasts for 4 beats. A Half Note lasts for 2 beats. A Quarter Note lasts for 1 beat.',
      'Time signatures tell us how the beats are organized. The most common is 4/4 time, meaning there are 4 beats in every measure, and the quarter note gets one beat.'
    ],
    quiz: [
      {
        question: 'How many beats does a Quarter Note typically get in 4/4 time?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 0
      },
      {
        question: 'What does the top number in a 4/4 time signature mean?',
        options: [
          'Play 4 notes per second',
          'There are 4 beats in a measure',
          'The quarter note gets the beat',
          'Play the music 4 times'
        ],
        correctAnswer: 1
      },
      {
        question: 'If a Whole Note is 4 beats, how many Half Notes equal one Whole Note?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1
      }
    ]
  }
];
