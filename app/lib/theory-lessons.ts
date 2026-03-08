// app/lib/theory-lessons.ts v2.4.2

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

const enLessons: TheoryLesson[] = [
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

const zhCNLessons: TheoryLesson[] = [
  {
    id: 'intro-notes',
    title: '1. 音乐字母表',
    content: [
      '音乐只使用七个字母：A, B, C, D, E, F 和 G。这些是自然音符，由钢琴上的白键表示。',
      'G 之后，字母表从 A 重新开始。一个音符与下一个同名音符之间的距离称为八度。',
      '黑键代表升号 (#) 和降号 (b) 音符。升号将音符升高半步，而降号将音符降低半步。',
      '例如，C 右侧紧邻的黑键是 C# (升 C)。它也位于 D 的左侧，因此也可以称为 Db (降 D)。'
    ],
    interactiveElement: {
      type: 'play-note',
      instruction: '尝试在键盘上找到并弹奏中央 C (MIDI 音符 60)。',
      targetMidi: [60]
    },
    quiz: [
      {
        question: '音乐字母表中有多少个字母？',
        options: ['5', '7', '12', '26'],
        correctAnswer: 1
      },
      {
        question: '一个 C 到下一个 C 之间的距离称为什么？',
        options: ['音程', '和弦', '八度', '音阶'],
        correctAnswer: 2
      },
      {
        question: '升号 (#) 对音符有什么作用？',
        options: ['降低半步', '升高半步', '使声音变大', '使声音变长'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'major-scale',
    title: '2. 大调音阶',
    content: [
      '音阶是按升序或降序排列的一系列音符。西方音乐中最常见的音阶是大调音阶。',
      '大调音阶是使用全音 (W) 和半音 (H) 的特定模式构建的。半音是从一个键到下一个键（白键或黑键）的距离。全音是两个半音。',
      '大调音阶的模式是：全 - 全 - 半 - 全 - 全 - 全 - 半。',
      '如果我们从 C 开始并遵循这个模式，我们只弹奏白键：C, D, E, F, G, A, B, C。这就是 C 大调音阶。'
    ],
    interactiveElement: {
      type: 'play-note',
      instruction: '从中央 C 开始弹奏 C 大调音阶 (C4, D4, E4, F4, G4, A4, B4, C5)。',
      targetMidi: [60, 62, 64, 65, 67, 69, 71, 72]
    },
    quiz: [
      {
        question: '大调音阶的全音 (W) 和半音 (H) 模式是什么？',
        options: [
          '全 - 半 - 全 - 半 - 全 - 半 - 全',
          '全 - 全 - 半 - 全 - 全 - 全 - 半',
          '半 - 全 - 全 - 半 - 全 - 全 - 全',
          '全 - 全 - 全 - 半 - 全 - 全 - 半'
        ],
        correctAnswer: 1
      },
      {
        question: '钢琴上哪个大调音阶只使用白键？',
        options: ['G 大调', 'F 大调', 'C 大调', 'D 大调'],
        correctAnswer: 2
      },
      {
        question: '多少个半音组成一个全音？',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'basic-chords',
    title: '3. 基础和弦 (三和弦)',
    content: [
      '和弦是三个或更多同时弹奏的音符。最基本的和弦类型是三和弦，由三个音符组成。',
      '三和弦是通过叠加三度音程构建的。在 C 大调音阶中，如果我们从 C 开始，跳过 D，弹奏 E，跳过 F，弹奏 G，我们就得到了 C 大调三和弦 (C - E - G)。',
      '三和弦的三个音符分别称为根音（起始音）、三音和五音。',
      '大和弦听起来“快乐”或“明亮”，而小和弦听起来“忧伤”或“阴暗”。小和弦是通过将大和弦的三音降低半步而创建的。'
    ],
    interactiveElement: {
      type: 'play-chord',
      instruction: '弹奏 C 大调三和弦 (C, E, G)。',
      targetMidi: [60, 64, 67]
    },
    quiz: [
      {
        question: '只有三个音符的和弦称为什么？',
        options: ['三和弦', '音阶', '八度', '音程'],
        correctAnswer: 0
      },
      {
        question: 'C 大调三和弦中的音符是什么？',
        options: ['C - D - E', 'C - F - G', 'C - E - G', 'C - Eb - G'],
        correctAnswer: 2
      },
      {
        question: '如何将大和弦变为小和弦？',
        options: [
          '将根音升高半步',
          '将三音降低半步',
          '将五音升高半步',
          '降低一个八度弹奏'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'intervals',
    title: '4. 理解音程',
    content: [
      '音程是两个音符之间的音高距离。它们是旋律和和弦的基石。',
      '音程根据其数字（音阶度数距离）和性质（大、小、完全、增、减）命名。',
      '例如，从 C 到下一个 D 的距离是“二度”。从 C 到 E 是“三度”。从 C 到 G 是“五度”。',
      '完全五度（如 C 到 G）是音乐中最稳定和最常见的音程之一，跨越 7 个半音。'
    ],
    quiz: [
      {
        question: '什么是音程？',
        options: [
          '音乐的速度',
          '两个音符之间的音高距离',
          '一种和弦类型',
          '音符的响度'
        ],
        correctAnswer: 1
      },
      {
        question: '从 C 到 G 的音程称为什么？',
        options: ['二度', '三度', '四度', '五度'],
        correctAnswer: 3
      },
      {
        question: '完全五度中有多少个半音？',
        options: ['4', '5', '7', '12'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'rhythm-basics',
    title: '5. 节奏与拍号',
    content: [
      '节奏是声音在时间上的安排。它决定了音符何时弹奏以及持续多久。',
      '节拍是音乐稳定的脉搏。音符是相对于这个节拍来衡量的。',
      '全音符持续 4 拍。二分音符持续 2 拍。四分音符持续 1 拍。',
      '拍号告诉我们节拍是如何组织的。最常见的是 4/4 拍，意味着每小节有 4 拍，四分音符为一拍。'
    ],
    quiz: [
      {
        question: '在 4/4 拍中，四分音符通常占多少拍？',
        options: ['1', '2', '3', '4'],
        correctAnswer: 0
      },
      {
        question: '4/4 拍号中的上层数字代表什么？',
        options: [
          '每秒弹奏 4 个音符',
          '每小节有 4 拍',
          '四分音符为一拍',
          '音乐弹奏 4 次'
        ],
        correctAnswer: 1
      },
      {
        question: '如果全音符是 4 拍，多少个二分音符等于一个全音符？',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1
      }
    ]
  }
];

const zhTWLessons: TheoryLesson[] = [
  {
    id: 'intro-notes',
    title: '1. 音樂字母表',
    content: [
      '音樂只使用七個字母：A, B, C, D, E, F 和 G。這些是自然音符，由鋼琴上的白鍵表示。',
      'G 之後，字母表從 A 重新開始。一個音符與下一個同名音符之間的距離稱為八度。',
      '黑鍵代表升號 (#) 和降號 (b) 音符。升號將音符升高半步，而降號將音符降低半步。',
      '例如，C 右側緊鄰的黑鍵是 C# (升 C)。它也位於 D 的左側，因此也可以稱為 Db (降 D)。'
    ],
    interactiveElement: {
      type: 'play-note',
      instruction: '嘗試在鍵盤上找到並彈奏中央 C (MIDI 音符 60)。',
      targetMidi: [60]
    },
    quiz: [
      {
        question: '音樂字母表中有多少個字母？',
        options: ['5', '7', '12', '26'],
        correctAnswer: 1
      },
      {
        question: '一個 C 到下一個 C 之間的距離稱為什麼？',
        options: ['音程', '和弦', '八度', '音階'],
        correctAnswer: 2
      },
      {
        question: '升號 (#) 對音符有什麼作用？',
        options: ['降低半步', '升高半步', '使聲音變大', '使聲音變長'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'major-scale',
    title: '2. 大調音階',
    content: [
      '音階是按升序或降序排列的一系列音符。西方音樂中最常見的音階是大調音階。',
      '大調音階是使用全音 (W) 和半音 (H) 的特定模式構建的。半音是從一個鍵到下一個鍵（白鍵或黑鍵）的距離。全音是兩個半音。',
      '大調音階的模式是：全 - 全 - 半 - 全 - 全 - 全 - 半。',
      '如果我們從 C 開始並遵循這個模式，我們只彈奏白鍵：C, D, E, F, G, A, B, C。這就是 C 大調音階。'
    ],
    interactiveElement: {
      type: 'play-note',
      instruction: '從中央 C 開始彈奏 C 大調音階 (C4, D4, E4, F4, G4, A4, B4, C5)。',
      targetMidi: [60, 62, 64, 65, 67, 69, 71, 72]
    },
    quiz: [
      {
        question: '大調音階的全音 (W) 和半音 (H) 模式是什麼？',
        options: [
          '全 - 半 - 全 - 半 - 全 - 半 - 全',
          '全 - 全 - 半 - 全 - 全 - 全 - 半',
          '半 - 全 - 全 - 半 - 全 - 全 - 全',
          '全 - 全 - 全 - 半 - 全 - 全 - 半'
        ],
        correctAnswer: 1
      },
      {
        question: '鋼琴上哪個大調音階只使用白鍵？',
        options: ['G 大調', 'F 大調', 'C 大調', 'D 大調'],
        correctAnswer: 2
      },
      {
        question: '多少個半音組成一個全音？',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'basic-chords',
    title: '3. 基礎和弦 (三和弦)',
    content: [
      '和弦是三個或更多同時彈奏的音符。最基本的和弦類型是三和弦，由三個音符組成。',
      '三和弦是通過疊加三度音程構建的。在 C 大調音階中，如果我們從 C 開始，跳过 D，彈奏 E，跳过 F，彈奏 G，我們就得到了 C 大調三和弦 (C - E - G)。',
      '三和弦的三個音符分別稱為根音（起始音）、三音和五音。',
      '大和弦聽起來“快樂”或“明亮”，而小和弦聽起來“憂傷”或“陰暗”。小和弦是通過將大和弦的三音降低半步而創建的。'
    ],
    interactiveElement: {
      type: 'play-chord',
      instruction: '彈奏 C 大調三和弦 (C, E, G)。',
      targetMidi: [60, 64, 67]
    },
    quiz: [
      {
        question: '只有三個音符的和弦稱為什麼？',
        options: ['三和弦', '音階', '八度', '音程'],
        correctAnswer: 0
      },
      {
        question: 'C 大調三和弦中的音符是什麼？',
        options: ['C - D - E', 'C - F - G', 'C - E - G', 'C - Eb - G'],
        correctAnswer: 2
      },
      {
        question: '如何將大和弦變為小和弦？',
        options: [
          '將根音升高半步',
          '將三音降低半步',
          '將五音升高半步',
          '降低一個八度彈奏'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'intervals',
    title: '4. 理解音程',
    content: [
      '音程是兩個音符之間的音高距離。它們是旋律和和弦的基石。',
      '音程根據其數字（音階度數距離）和性質（大、小、完全、增、減）命名。',
      '例如，從 C 到下一個 D 的距離是“二度”。從 C 到 E 是“三度”。從 C 到 G 是“五度”。',
      '完全五度（如 C 到 G）是音樂中最穩定和最常見的音程之一，跨越 7 個半音。'
    ],
    quiz: [
      {
        question: '什麼是音程？',
        options: [
          '音樂的速度',
          '兩個音符之間的音高距離',
          '一種和弦類型',
          '音符的響度'
        ],
        correctAnswer: 1
      },
      {
        question: '從 C 到 G 的音程稱為什麼？',
        options: ['二度', '三度', '四度', '五度'],
        correctAnswer: 3
      },
      {
        question: '完全五度中有多少個半音？',
        options: ['4', '5', '7', '12'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'rhythm-basics',
    title: '5. 節奏與拍號',
    content: [
      '節奏是聲音在時間上的安排。它決定了音符何時彈奏以及持續多久。',
      '節拍是音樂穩定的脈搏。音符是相對於這個節拍來衡量的。',
      '全音符持續 4 拍。二分音符持續 2 拍。四分音符持續 1 拍。',
      '拍號告訴我們節拍是如何組織的。最常見的是 4/4 拍，意味著每小節有 4 拍，四分音符為一拍。'
    ],
    quiz: [
      {
        question: '在 4/4 拍中，四分音符通常佔多少拍？',
        options: ['1', '2', '3', '4'],
        correctAnswer: 0
      },
      {
        question: '4/4 拍號中的上層數字代表什麼？',
        options: [
          '每秒彈奏 4 個音符',
          '每小節有 4 拍',
          '四分音符為一拍',
          '音樂彈奏 4 次'
        ],
        correctAnswer: 1
      },
      {
        question: '如果全音符是 4 拍，多少個二分音符等於一個全音符？',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1
      }
    ]
  }
];

export const getTheoryLessons = (locale: string): TheoryLesson[] => {
  if (locale === 'zh-CN') return zhCNLessons;
  if (locale === 'zh-TW') return zhTWLessons;
  return enLessons;
};

export const theoryLessons = enLessons; // Keep for backward compatibility if needed
