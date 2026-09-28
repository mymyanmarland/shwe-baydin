"use strict";
// Astrology reference data: Myanmar 7 weekdays + 12 zodiac signs (Myanmar names),
// and Mahabote (မဟာဘုတ်) cycle explanations.

// Display order follows Myanmar tradition: Sunday first.
const DAYS = [
  { key: "sun", my: "တနင်္ဂနွေ", en: "Sunday", planet_my: "နေ", planet_en: "Sun" },
  { key: "mon", my: "တနင်္လာ", en: "Monday", planet_my: "လ", planet_en: "Moon" },
  { key: "tue", my: "အင်္ဂါ", en: "Tuesday", planet_my: "အင်္ဂါ", planet_en: "Mars" },
  { key: "wed", my: "ဗုဒ္ဓဟူး", en: "Wednesday", planet_my: "ဗုဒ္ဓဟူး", planet_en: "Mercury" },
  { key: "thu", my: "ကြာသပတေး", en: "Thursday", planet_my: "ကြာသပတေး", planet_en: "Jupiter" },
  { key: "fri", my: "သောကြာ", en: "Friday", planet_my: "သောကြာ", planet_en: "Venus" },
  { key: "sat", my: "စနေ", en: "Saturday", planet_my: "စနေ", planet_en: "Saturn" },
];

const ZODIACS = [
  { key: "aries", my: "မိဿရာသီ", en: "Aries", dates_my: "မတ် ၂၁ – ဧပြီ ၁၉", dates_en: "Mar 21 – Apr 19" },
  { key: "taurus", my: "ပြိဿရာသီ", en: "Taurus", dates_my: "ဧပြီ ၂၀ – မေ ၂၀", dates_en: "Apr 20 – May 20" },
  { key: "gemini", my: "မေထုန်ရာသီ", en: "Gemini", dates_my: "မေ ၂၁ – ဇွန် ၂၀", dates_en: "May 21 – Jun 20" },
  { key: "cancer", my: "ကရကဋ်ရာသီ", en: "Cancer", dates_my: "ဇွန် ၂၁ – ဇူလိုင် ၂၂", dates_en: "Jun 21 – Jul 22" },
  { key: "leo", my: "သိဟ်ရာသီ", en: "Leo", dates_my: "ဇူလိုင် ၂၃ – ဩဂုတ် ၂၂", dates_en: "Jul 23 – Aug 22" },
  { key: "virgo", my: "ကန်ရာသီ", en: "Virgo", dates_my: "ဩဂုတ် ၂၃ – စက်တင်ဘာ ၂၂", dates_en: "Aug 23 – Sep 22" },
  { key: "libra", my: "တူရာသီ", en: "Libra", dates_my: "စက်တင်ဘာ ၂၃ – အောက်တိုဘာ ၂၂", dates_en: "Sep 23 – Oct 22" },
  { key: "scorpio", my: "ဗြိစ္ဆာရာသီ", en: "Scorpio", dates_my: "အောက်တိုဘာ ၂၃ – နိုဝင်ဘာ ၂၁", dates_en: "Oct 23 – Nov 21" },
  { key: "sagittarius", my: "ဓနုရာသီ", en: "Sagittarius", dates_my: "နိုဝင်ဘာ ၂၂ – ဒီဇင်ဘာ ၂၁", dates_en: "Nov 22 – Dec 21" },
  { key: "capricorn", my: "မကာရရာသီ", en: "Capricorn", dates_my: "ဒီဇင်ဘာ ၂၂ – ဇန်နဝါရီ ၁၉", dates_en: "Dec 22 – Jan 19" },
  { key: "aquarius", my: "ကုမ်ရာသီ", en: "Aquarius", dates_my: "ဇန်နဝါရီ ၂၀ – ဖေဖော်ဝါရီ ၁၈", dates_en: "Jan 20 – Feb 18" },
  { key: "pisces", my: "မိန်ရာသီ", en: "Pisces", dates_my: "ဖေဖော်ဝါရီ ၁၉ – မတ် ၂၀", dates_en: "Feb 19 – Mar 20" },
];

// Mahabote (မဟာဘုတ်): 7-stage cycle.
// idx = (currentMyanmarYear - birthMyanmarYear) mod 7, Myanmar year = Gregorian - 638.
const MAHABOTE = [
  {
    my: "ဘင်္ဂ", en: "Binga",
    text_my: "ပျက်စီးဆုံးရှုံးခြင်းကို ဆိုလိုသော ကာလဖြစ်သည်။ အရေးကြီးသော ဆုံးဖြတ်ချက်များ၊ ငွေကြေးရင်းနှီးမြှုပ်နှံမှုများ၊ ခရီးဝေးသွားလာမှုများတွင် အထူးသတိထားပါ။ စိတ်ရှည်သည်းခံခြင်းနှင့် ကုသိုလ်ကောင်းမှုပြုခြင်းက အဆိုးကို ပျော့ပျောင်းစေနိုင်သည်။",
    text_en: "A period signifying loss and breakdown. Be extra careful with major decisions, investments and long journeys. Patience and good deeds soften its effects.",
  },
  {
    my: "အထွန်း", en: "Atun",
    text_my: "ထွန်းလင်းတောက်ပသော ကာလဖြစ်သည်။ အလုပ်အကိုင်၊ ပညာရေး၊ စီးပွားရေးတို့တွင် တိုးတက်အောင်မြင်မည်။ အခွင့်အလမ်းသစ်များ ရောက်လာလျှင် ရဲရဲဝံ့ဝံ့ ဆုပ်ကိုင်လိုက်ပါ။ ကြိုးစားသမျှ အရာထင်မည့်အချိန်ဖြစ်သည်။",
    text_en: "A radiant, rising period. Career, education and business will flourish. Seize new opportunities boldly — effort now brings visible results.",
  },
  {
    my: "သရေ", en: "Thara",
    text_my: "သာယာချမ်းမြေ့သော ကာလဖြစ်သည်။ မိသားစု၊ မိတ်ဆွေ၊ ချစ်သူများနှင့် ဆက်ဆံရေး ချိုမြိန်မည်။ စိတ်အေးချမ်းသာစွာ နေထိုင်နိုင်ပြီး အနုပညာ၊ အလှအပဆိုင်ရာ ကိစ္စများ အဆင်ပြေမည်။",
    text_en: "A pleasant, harmonious period. Relationships with family, friends and loved ones sweeten. Good time for art, beauty and peaceful living.",
  },
  {
    my: "အဓိပတိ", en: "Adipati",
    text_my: "အာဏာတန်ခိုးရရှိသော ကာလဖြစ်သည်။ ခေါင်းဆောင်မှုအခွင့်အလမ်းများ၊ ရာထူးတိုးတက်မှုများ ရောက်လာနိုင်သည်။ တာဝန်ကြီးများကို ယူရဲလျှင် ဂုဏ်သိက္ခာနှင့်အတူ အောင်မြင်မှု ရမည်။",
    text_en: "A period of authority and power. Leadership chances and promotions may arrive. Take on big responsibilities — honor and success follow.",
  },
  {
    my: "မရဏ", en: "Marana",
    text_my: "ကျန်းမာရေးကို အထူးဂရုစိုက်ရမည့်ကာလဖြစ်သည်။ လုံလောက်စွာ အနားယူပါ၊ ကျန်းမာရေးစစ်ဆေးမှုများ လုပ်သင့်သည်။ အန္တရာယ်များသော လုပ်ငန်းများ၊ အငြင်းပွားမှုများ ရှောင်ရှားပါ။",
    text_en: "A period demanding care for your health. Rest well and get check-ups. Avoid risky ventures and disputes.",
  },
  {
    my: "သိုက်", en: "Thike",
    text_my: "စုဆောင်းသိုမှီးရသော ကာလဖြစ်သည်။ ငွေကြေးစုဆောင်းခြင်း၊ ရင်းနှီးမြှုပ်နှံမှုများ အကျိုးဖြစ်ထွန်းမည်။ ချွေတာစုဆောင်းရန် အကောင်းဆုံးအချိန်ဖြစ်ပြီး ပစ္စည်းဥစ္စာတိုးပွားနိုင်သည်။",
    text_en: "A period of accumulation. Saving and investments bear fruit. The best time to be thrifty — wealth can grow.",
  },
  {
    my: "ရာဇ", en: "Raja",
    text_my: "မင်းမှုထမ်းရာ ဂုဏ်သိက္ခာရသော ကာလဖြစ်သည်။ လူအများ၏ လေးစားချစ်ခင်မှုကို ရမည်။ ကြီးကျယ်သော အစီအစဉ်များ၊ စီမံကိန်းသစ်များ စတင်ရန် အထူးသင့်တော်သော အချိန်ဖြစ်သည်။",
    text_en: "A regal period of honor and prestige. You earn people's respect and affection. An excellent time to launch grand plans.",
  },
];

function findSign(system, key) {
  const list = system === "zodiac" ? ZODIACS : DAYS;
  return list.find((s) => s.key === key) || null;
}

function mahaboteFor(birthGregorianYear, nowDate) {
  const now = nowDate || new Date();
  const curMy = now.getFullYear() - 638;
  const birthMy = Number(birthGregorianYear) - 638;
  const idx = (((curMy - birthMy) % 7) + 7) % 7;
  return { index: idx, ...MAHABOTE[idx], myanmarYear: curMy };
}

module.exports = { DAYS, ZODIACS, MAHABOTE, findSign, mahaboteFor };
