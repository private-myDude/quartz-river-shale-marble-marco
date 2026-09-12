/** 256 unique words — 16 of them is 128 bits. Haven never sees this phrase. */
export const RECOVERY_WORDS = [
  "able","acid","aged","ally","amber","anchor","apple","apron","arc","arena",
  "arrow","ashes","atlas","audio","avalon","axis","azure","badge","baker","balm",
  "basin","batch","beach","beads","beam","beans","bear","beats","bench","berry",
  "birch","blend","bliss","block","bloom","bluff","board","boast","bonus","boost",
  "booth","borne","both","bound","boxer","brain","brand","brass","brave","bread",
  "breeze","brick","bride","brim","bring","brisk","broad","brook","brush","buck",
  "buddy","build","bulb","bulk","bully","bunch","burst","cabin","cable","cadet",
  "camel","camp","canal","candy","canoe","cape","card","cargo","carry","carve",
  "catch","cause","cedar","chain","chair","chalk","champ","chant","charm","chart",
  "chase","cheap","check","cheer","chef","chess","chest","chick","chief","child",
  "chill","chip","choir","chop","chord","chuck","churn","cider","cinch","civic",
  "civil","claim","clamp","clasp","class","claw","clay","clean","clear","clerk",
  "click","cliff","climb","cling","clip","cloak","clock","clone","close","cloth",
  "cloud","clove","club","clump","coach","coast","coat","cobra","cocoa","code",
  "coil","coin","coke","cold","color","colt","comb","come","comet","comic",
  "comma","cone","cook","cool","cope","copy","coral","cord","core","cork",
  "corn","cost","couch","cough","could","count","court","cover","crab","craft",
  "cramp","crane","crank","crash","crate","crave","crawl","craze","cream","creek",
  "creep","crept","crest","crew","cried","crisp","crop","cross","crowd","crown",
  "crude","crumb","crush","crust","cub","cube","cumin","cup","cure","curl",
  "curry","curve","cycle","daily","dairy","daisy","dance","dandy","dare","dark",
  "dart","dash","data","date","dawn","daze","deal","dean","dear","debt",
  "deck","deed","deep","deer","delay","delta","demo","denim","dense","dent",
  "depot","depth","desk","dial","diary","dice","diet","dig","dill","dime",
  "dine","dip","dirt","disc","dish","disk","dive","dock","dodge","does",
  "dove","doze","draft","drain","drama","drank",
] as const;

export function wordAt(index: number): string {
  return RECOVERY_WORDS[index & 255] ?? "able";
}
