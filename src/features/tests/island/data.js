/**
 * Mellow Wave - 무인도 생존유형 테스트 (심리테스트 데이터)
 * 10문항 유형 분류형 → 4가지 생존 유형 결과
 */

export const islandQuestions = [
    {
        id: 1,
        q: "무인도에 불시착! 가장 먼저 하는 행동은?",
        answers: [
            { text: "상황 파악이 먼저! 사람들을 모아 역할을 분담한다. '자, 일단 진정하시고요!' 📋", type: "leader" },
            { text: "저기 저 섬광탄 같은 건 뭐지? 혼자 빠르게 주변을 정찰하러 나선다. 🗺️", type: "explorer" },
            { text: "배가 가라앉기 전에 물과 비상식량부터 쟁여둔다. 생존이 최우선! 🥥", type: "survivor" },
            { text: "패닉에 빠져 우는 사람들을 다독이며 안심시킨다. '괜찮아요, 살 수 있어요!' 🤗", type: "diplomat" }
        ]
    },
    {
        id: 2,
        q: "밤이 됐어요. 잠자리를 어떻게 해결할까?",
        answers: [
            { text: "효율이 생명! 팀을 지휘해서 체계적으로 대형 쉘터를 짓는다. 🏗️", type: "leader" },
            { text: "땅은 위험할 수 있어. 높은 나무 위나 절벽 동굴을 먼저 탐색한다. ⛰️", type: "explorer" },
            { text: "넓은 잎부터 주워와서 체온을 유지할 수 있는 개인 보금자리를 뚝딱 만든다. 🌿", type: "survivor" },
            { text: "체온을 나누기 위해 모두가 둥글게 모여 잘 수 있는 공동 쉘터를 제안한다. 🏕️", type: "diplomat" }
        ]
    },
    {
        id: 3,
        q: "식수를 찾아야 해요. 당신의 전략은?",
        answers: [
            { text: "탐색조와 정수조로 인원을 나눠서 가장 확률 높은 방식을 시도한다. 📊", type: "leader" },
            { text: "저 산 너머에 폭포가 있지 않을까? 물소리를 찾아 정글 깊숙이 들어간다. 🌊", type: "explorer" },
            { text: "야자수 잎과 비닐을 이용해 이슬과 빗물을 모으는 장치를 당장 만든다. 🔧", type: "survivor" },
            { text: "다들 지쳐있으니 의견을 묻고, 가장 다수가 동의하는 안전한 위치부터 찾는다. 🙋", type: "diplomat" }
        ]
    },
    {
        id: 4,
        q: "갑자기 이상한 동물 소리가 들려요!",
        answers: [
            { text: "조용! 당황하지 마. 내가 확인하고 올 테니 숨어있어! 🛡️", type: "leader" },
            { text: "처음 들어보는 울음소리인데? 신기한 생물일지 몰라, 소리나는 쪽으로 몰래 가본다. 🔍", type: "explorer" },
            { text: "야생동물일 수 있어. 미리 깎아둔 창을 쥐고 불 주변으로 방어선을 구축한다. 🪤", type: "survivor" },
            { text: "다 같이 손을 잡고 둥글게 모여서 서로 의지하며 밤이 지나가길 기다린다. 🤝", type: "diplomat" }
        ]
    },
    {
        id: 5,
        q: "표류 5일째, 식량이 바닥나기 시작해요.",
        answers: [
            { text: "가진 식량을 10일치로 쪼개 배급 규칙을 정비하고 할당량을 준수하게 한다. ⚖️", type: "leader" },
            { text: "이 주변은 다 털었어. 위험하더라도 섬의 반대편 미지의 구역으로 넘어가 본다. 🏝️", type: "explorer" },
            { text: "물때를 계산해서 얕은 바다에 피싱 스나이퍼 덫을 여러 개 설치한다. 🎣", type: "survivor" },
            { text: "어린이와 환자 등 체력이 약한 사람에게 먼저 돌아갈 수 있도록 사람들을 둥글게 설득한다. 🍽️", type: "diplomat" }
        ]
    },
    {
        id: 6,
        q: "일행 사이에 심각한 갈등이 생겼어요!",
        answers: [
            { text: "상황을 냉정히 정리한 뒤 최종 단안을 내린다. 생사기로에서 논쟁은 사치야! ⚡", type: "leader" },
            { text: "머리가 아프네. 잠시 떨어져 바람이나 쐬면서 산책하며 새로운 단서를 찾으러 간다. 🚶", type: "explorer" },
            { text: "말싸움 할 시간에 내일 쓸 땔감이나 한 짐 더 구해온다. 행동이 답이다. 🔨", type: "survivor" },
            { text: "양쪽 다 사연이 있겠지. 조용히 불러 이야기를 들어주고 부드럽게 타협점을 찾아준다. 💬", type: "diplomat" }
        ]
    },
    {
        id: 7,
        q: "멀리서 배가 보여요! 신호를 보내야 해요!",
        answers: [
            { text: "긴급 임무 하달! '크게 불 피우는 조, 깃발 흔드는 조, 모래사장 SOS 짜는 조 움직여!' 📣", type: "leader" },
            { text: "가장 높은 절벽이나 가장 튀어나온 곶으로 미친듯이 달려서 내 존재를 알린다! 🧗", type: "explorer" },
            { text: "평소에 미리 세팅해둔 대형 연기 신호탄에 불을 붙이고 거울로 빛을 정확히 반사한다. 🪞", type: "survivor" },
            { text: "모두가 패닉에 빠지지 않게 독려하며, '살 수 있어요! 다같이 소리지릅시다!' 외친다. 📢", type: "diplomat" }
        ]
    },
    {
        id: 8,
        q: "구조를 기다리며 할 수 있는 단 하나의 일이 있다면?",
        answers: [
            { text: "다음 주까지 구조되지 않을 최악을 대비해, 캠프의 규칙과 식수 배분 시스템을 완벽히 짠다. 📝", type: "leader" },
            { text: "섬 전체를 나만의 아지트로 삼기 위해 아직 못 가본 동굴과 밀림 지도를 구상한다. 🗺️", type: "explorer" },
            { text: "비바람을 완벽히 막아줄 지붕을 보수하고, 사냥 확률을 높일 작살을 뾰족하게 간다. ⚙️", type: "survivor" },
            { text: "불안해하는 사람들과 모닥불에 모여앉아, 구조된 뒤 먹고 싶은 음식 리스트를 공유한다. 🔥", type: "diplomat" }
        ]
    },
    {
        id: 9,
        q: "무인도에서 가장 힘든 순간은?",
        answers: [
            { text: "위기를 구해주려는데 내 지시나 통제를 사람들이 불신하고 따르지 않을 때. 😤", type: "leader" },
            { text: "며칠 갇혀있었더니 섬에서 더 이상 낯선 곳이나 볼거리가 떨어졌을 때. 극강의 지루함! 😩", type: "explorer" },
            { text: "맨손과 내 지식만으로는 절대 뚫지 못할 막막한 현실적 절벽(자연재해, 질병 등)에 직면했을 때. 😟", type: "survivor" },
            { text: "이기심이 터지면서 사람들이 서로를 원망하고 탓하며 날이 선 모습을 지켜봐야 할 때. 😢", type: "diplomat" }
        ]
    },
    {
        id: 10,
        q: "드디어 구조 됐어요! 문명으로 돌아가면 가장 먼저?",
        answers: [
            { text: "바로 인터뷰를 잡고 이 기상천외한 경험을 바탕으로 리더십/위기관리 서적을 출판한다. 📖", type: "leader" },
            { text: "몸져 눕기는 커녕 못해봤던 서핑을 치거나 다음은 사막이 어떨지 미친 모험을 구상한다. 🌎", type: "explorer" },
            { text: "자연의 무서움을 깨닫고 한동안 집 밖으로 안 나가고 모든 문명의 이기를 온몸으로 즐긴다. 🎓", type: "survivor" },
            { text: "생사고락을 함께한 동료들과 단톡방을 만들고, '그땐 그랬지' 하며 재회 술자리를 주도한다. 🥂", type: "diplomat" }
        ]
    }
];

// Supabase Storage URL - test_image 버킷 내 island_test 폴더
const ISLAND_BASE_URL = "https://hykzfvrmnnykvinhtucc.supabase.co/storage/v1/object/public/test_image/island_test/";

export const islandMetaData = {
    testId: 'island',
    bannerLayout: 'panoramic' // [Design Architecture] 전면 파노라마 레이아웃 강제
};

export const islandResults = {
    leader: {
        name: "카리스마 리더",
        image: `${ISLAND_BASE_URL}leader.webp`,
        emoji: "👑",
        subtitle: "위기의 섬을 이끄는 사령관",
        type: "leader",
        color: "from-amber-500 to-orange-600",
        bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
        iconBg: "bg-amber-100",
        desc: "'따라와라, 살려줄 테니!'\n\n조난이라는 절망적인 상황 속에서 당신의 진가가 찬란하게 빛을 발합니다. 울부짖는 사람들의 멘탈을 잡아채고, 즉각적으로 역할을 분배하는 타고난 사령관이죠.\n\n불이 필요할 때, 우왕좌왕하는 이들 사이에서 '너는 나무를 줍고, 너는 불씨를 지켜라'라고 외치며 혼돈을 질서로 바꿉니다. 강한 결단력으로 집단을 생존의 길로 이끌어내지만, 엄청난 속도로 번아웃이 올 수 있으니 때로는 숨을 고르고 타인의 의견을 수렴하는 여유를 가져보세요. 당신은 이미 모두가 의지하는 버팀목입니다.",
        tags: ["#타고난리더", "#결단력", "#책임감", "#카리스마"],
        traits: { leadership: 95, survival: 70, exploration: 60, social: 75 }
    },
    explorer: {
        name: "호기심 많고 자유로운 탐험가",
        image: `${ISLAND_BASE_URL}explorer.webp`,
        emoji: "🧭",
        subtitle: "미지의 세계를 열어가는 개척자",
        type: "explorer",
        color: "from-emerald-500 to-teal-600",
        bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-700",
        iconBg: "bg-emerald-100",
        desc: "'조난? 아뇨, 여긴 VIP 전용 프라이빗 리조트인데요?'\n\n남들은 언제 죽을지 몰라 공포에 떨 때, 당신의 심장박동은 호기심으로 요동칩니다. 절벽 너머에 무엇이 있을지, 저 희한하게 생긴 열매는 무슨 맛일지 궁금해서 견딜 수가 없죠.\n\n남이 모르는 은밀한 해변이나 아지트를 찾아내고, 기상천외한 방식으로 위기를 타개하는 창의력 1티어 생존자입니다. 지루함을 참지 못해 자꾸 선을 넘는 모험을 강행하곤 하니, 당신의 생존율 곡선은 그야말로 롤러코스터! 가끔은 멈춰 서서 현실적인 리스크를 계산해 보는 고요함이 필요합니다.",
        tags: ["#호기심폭발", "#개척자", "#모험가", "#용감무쌍"],
        traits: { leadership: 55, survival: 65, exploration: 95, social: 50 }
    },
    survivor: {
        name: "고독한 생존가",
        image: `${ISLAND_BASE_URL}survivor.webp`,
        emoji: "🔥",
        subtitle: "맨손으로 문명을 건설하는 장인",
        type: "survivor",
        color: "from-stone-500 to-zinc-600",
        bgColor: "bg-gradient-to-br from-stone-50 to-zinc-50",
        borderColor: "border-stone-200",
        textColor: "text-stone-700",
        iconBg: "bg-stone-100",
        desc: "'문명이 없다면, 내 손으로 직접 만들면 되는 거니까.'\n\n나뭇가지와 돌맹이만 떨어뜨려 놔도 닷새 후엔 통나무집을 지어낼 현생 베어 그릴스입니다. 요란한 말싸움 대신 묵묵히 칼을 갈고 사냥의 덫을 놓는 극한의 실용주의자죠.\n\n불 한 번 못 피워 쩔쩔매는 사람들 사이에서 툭 하고 빗물 정수기를 완성시키는 당신은 소리 없는 생존의 신입니다. 뛰어난 기술력과 문제 해결력으로 혼자서도 끝까지 살아남을 저력이 있지만, 너무 감정을 배제하고 홀로 안고 가려는 성향이 강해요. 생존은 기술로만 하는 게 아닙니다, 온기를 나누세요!",
        tags: ["#맥가이버", "#실용주의", "#손재주", "#무적생존"],
        traits: { leadership: 60, survival: 95, exploration: 70, social: 45 }
    },
    diplomat: {
        name: "평화주의 외교관",
        image: `${ISLAND_BASE_URL}diplomat.webp`,
        emoji: "🤝",
        subtitle: "사람들을 하나로 묶는 화합의 달인",
        type: "diplomat",
        color: "from-sky-500 to-blue-600",
        bgColor: "bg-gradient-to-br from-sky-50 to-blue-50",
        borderColor: "border-sky-200",
        textColor: "text-sky-700",
        iconBg: "bg-sky-100",
        desc: "'배고픈 것보다 무서운 건, 우리가 서로를 향해 날카로워지는 거야.'\n\n물방울이 맺힌 야자수 밑동보다 사람의 눈물을 먼저 닦아주는 진정한 인류애의 소유자입니다. 혹독한 환경 속에서 이기심이 이빨을 드러낼 때, 당신의 따뜻한 중재가 없다면 캠프는 이미 아수라장이 되었을 겁니다.\n\n위협적인 리더십보다 부드러운 화합으로 모두의 능력을 200% 이끌어내는 당신! 그로 인해 팀의 생존 확률은 눈부시게 올라가지만, 정작 남을 챙기느라 자신의 몫을 양보하고 굶주릴 때가 많습니다. 다 같이 사는 것도 중요하지만, 당신 스스로를 귀하게 여기는 걸 1순위로 두세요.",
        tags: ["#화합전문가", "#배려왕", "#소통능력자", "#팀플레이"],
        traits: { leadership: 65, survival: 55, exploration: 50, social: 95 }
    },
};




