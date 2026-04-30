export interface LocationData {
  id: string;
  name: string;
  nameEn: string;
  characterName: string;
  hitArea: { x: number; y: number; w: number; h: number };
  character: { x: number; y: number; width: number; image: string };
  coverImage: string;
  sceneImage?: string;
  description: string;
  playlist: string;
  playlists?: { label: string; url: string }[];
  audioPreviews?: { title: string; url: string }[];
  videos?: { title: string; url: string }[];
  underConstruction?: boolean;
}

export const LOCATIONS: LocationData[] = [
  {
    id: 'paper-world',
    name: '紙箱天地',
    nameEn: 'Paper Box World',
    characterName: '紙箱精靈',
    hitArea: { x: 10, y: 5, w: 18, h: 25 },
    character: { x: 19, y: 18, width: 10, image: 'characters/paper-world.png' },
    coverImage: 'characters/paper-world.png',
    description: '在這方堆疊起的紙箱國度，每一片紙板都是夢想的疆界。輕快、童趣、無拘無束的旋律在此誕生，是最純真的快樂角落。',
    playlist: ''
  },
  {
    id: 'sealed-realm',
    name: '電子江湖',
    nameEn: 'Sealed Realm',
    characterName: '紅瞳守護者',
    hitArea: { x: 34, y: 12, w: 12, h: 18 },
    character: { x: 42, y: 20, width: 9, image: 'characters/sealed-realm.png' },
    coverImage: 'characters/sealed-realm.png',
    sceneImage: 'https://images4.imagebam.com/50/ba/90/ME1CNCDJ_o.png',
    description: '封印於迷霧中的禁忌之地，紅瞳老者鎮守於此。奇詭、神祕、東方異色——只有命定之人才能窺見此地的旋律處理。',
    playlist: ''
  },
  {
    id: 'pure-utopia',
    name: '純白烏托邦',
    nameEn: 'Pure Utopia',
    characterName: '機械歌姬',
    hitArea: { x: 55, y: 18, w: 12, h: 18 },
    character: { x: 60, y: 26, width: 10, image: 'characters/pure-utopia.png' },
    coverImage: 'characters/pure-utopia.png',
    sceneImage: 'https://images4.imagebam.com/ec/65/4b/ME1CNCDI_o.png',
    description: '在純白的霓虹深處，潛伏著機械之翼。賽博龐克、迷離電子、未來感濃濃厚的身響，帶你穿越冰冷與情感的邊界。',
    playlist: ''
  },
  {
    id: 'cyber-island',
    name: '電音遊樂園',
    nameEn: 'Cyber Carnival',
    characterName: '霓虹 DJ',
    hitArea: { x: 72, y: 8, w: 20, h: 25 },
    character: { x: 82, y: 16, width: 12, image: 'characters/cyber-island.png' },
    coverImage: 'characters/cyber-island.png',
    description: '霓虹摩天輪轉動不息，紫髮少女駐守唱盤。EDM、Future Bass、Synthwave——讓每一個音符都成為派對的火花。',
    playlist: ''
  },
  {
    id: 'rock-island',
    name: '搖滾叢林',
    nameEn: 'Rock Jungle',
    characterName: '叢林貝斯手',
    hitArea: { x: 5, y: 48, w: 18, h: 22 },
    character: { x: 12, y: 56, width: 11, image: 'characters/rock-island.png' },
    coverImage: 'characters/rock-island.png',
    description: '熱帶叢林深處，巨型音響轟鳴。在這裡只有節奏與呼喊——搖滾、金屬、龐克，所有不羈靈魂的歸處。',
    underConstruction: true,
    playlist: ''
  },
  {
    id: 'bar-isle',
    name: '吟遊酒館',
    nameEn: 'Bardic Tavern',
    characterName: '曼陀林詩人',
    hitArea: { x: 25, y: 38, w: 12, h: 20 },
    character: { x: 30, y: 48, width: 10, image: 'characters/bar-isle.png' },
    coverImage: 'characters/bar-isle.png',
    description: '昏黃燈下，威士忌晃動著故事。爵士、靈魂、藍調——讓沙啞的嗓音與煙霧一起，溶進深夜的時光。',
    underConstruction: true,
    playlist: ''
  },
  {
    id: 'data-tree',
    name: '數據世界之樹',
    nameEn: 'Data World Tree',
    characterName: '數據精靈',
    hitArea: { x: 42, y: 42, w: 20, h: 25 },
    character: { x: 52, y: 55, width: 11, image: 'characters/data-tree.png' },
    coverImage: 'characters/data-tree.png',
    description: '世界的中心，連結所有音樂之地。在這裡，數據化作枝葉，旋律化作果實。所有故事的起點，也是所有旅程的歸途。',
    playlist: ''
  },
  {
    id: 'headphone-isle',
    name: '耳機之間',
    nameEn: 'Headphone Room',
    characterName: '夢境少年',
    hitArea: { x: 66, y: 42, w: 14, h: 20 },
    character: { x: 72, y: 52, width: 10, image: 'characters/headphone-isle.png' },
    coverImage: 'characters/headphone-isle.png',
    description: '巨大耳機罩下，少年抱著熊與夢一同沉睡。Lo-fi、Chill、輕音樂——讓世界的嘈雜暫時遠離，只剩下溫柔的呼吸聲。',
    underConstruction: true,
    playlist: ''
  },
  {
    id: 'piano-isle',
    name: '鋼琴島',
    nameEn: 'Piano Isle',
    characterName: '星河琴師',
    hitArea: { x: 80, y: 48, w: 14, h: 22 },
    character: { x: 90, y: 58, width: 11, image: 'characters/piano-isle.png' },
    coverImage: 'characters/piano-isle.png',
    description: '小小琴師指尖流淌出星河。古典鋼琴、純音樂、抒情敘事——每一個音符都是時光的標記，輕輕敲打心底最柔軟的角落。',
    underConstruction: true,
    playlist: ''
  },
  {
    id: 'hyakki-yakou',
    name: '百鬼夜曲',
    nameEn: 'Hyakki Yakou',
    characterName: '妖狐道士',
    hitArea: { x: 5, y: 75, w: 18, h: 22 },
    character: { x: 11, y: 85, width: 13, image: 'characters/hyakki-yakou.png' },
    coverImage: 'characters/hyakki-yakou.png',
    description: '紅燈籠下，妖狐與道士共飲。和風、神秘、節慶氛圍交織，每一個音符都像一場月夜下的祭典。',
    playlist: ''
  },
  {
    id: 'sanzu-river',
    name: '三途川',
    nameEn: 'Sanzu River',
    characterName: '渡川少女',
    hitArea: { x: 28, y: 72, w: 18, h: 22 },
    character: { x: 35, y: 80, width: 12, image: 'characters/sanzu-river.png' },
    coverImage: 'characters/sanzu-river.png',
    description: '彼岸花綻放於幽暗之川，少女獨坐扁舟。哀愁、思念、靜謐的東方情調，是夜深人靜時最溫柔的低語。',
    playlist: ''
  },
  {
    id: 'broken-track',
    name: '壞軌區',
    nameEn: 'Broken Track Zone',
    characterName: '節拍駭客',
    hitArea: { x: 53, y: 72, w: 18, h: 22 },
    character: { x: 60, y: 82, width: 11, image: 'characters/broken-track.png' },
    coverImage: 'characters/broken-track.png',
    description: '霓虹街頭，扭曲節拍。當系統崩壞，音律以最狂野的姿態重生。電子搖滾、嘻哈、能量爆裂的曲目集結地。',
    playlist: ''
  },
  {
    id: 'mirror-void',
    name: '鏡中虛空',
    nameEn: 'Mirror Void',
    characterName: '鏡像之影',
    hitArea: { x: 74, y: 75, w: 18, h: 22 },
    character: { x: 80, y: 82, width: 14, image: 'characters/mirror-void.png' },
    coverImage: 'characters/mirror-void.png',
    description: '黑色漩渦之中，鋼琴聲縈繞著彼岸花。古典、敘事、帶有戲劇張力的樂章在此流轉，是反思與沉澱的私密空間處理。',
    playlist: ''
  }
];
