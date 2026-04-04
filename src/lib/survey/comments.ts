import type { QuestionCategory } from "./questions";

export type ScaleLevel = "excellent" | "good" | "average" | "poor" | "critical";

export interface CategoryComment {
  short: { ja: string; en: string };
  detail: { ja: string; en: string };
}

/**
 * SQWサーベイ コメントデータ
 * 
 * 構造: COMMENTS[category][level] = { short: {ja, en}, detail: {ja, en} }
 * 
 * 現在5段階（excellent/good/average/poor/critical）
 * 将来10段階に拡張する場合は、ScaleLevelに新レベルを追加し、
 * 各カテゴリに対応するコメントを追加するだけで対応可能
 */
export const COMMENTS: Record<
  Exclude<QuestionCategory, "management">,
  Record<ScaleLevel, CategoryComment>
> = {
  // 景色
  landscape: {
    excellent: {
      short: {
        ja: `このワゴンはきれいな景色に向かって進んでいるようです。`,
        en: `The wagon is headed toward a beautiful `,
      },
      detail: {
        ja: `メンバー全員がこの旅の目的に確信を持っており、目的地には素晴らしい世界があることを信じて疑っていないようです。 このワゴンの旅の一員であることにとても誇りを感じており、この旅に大きな意義を見出しているようです。`,
        en: `Everyone in your team believes in the purpose of this trip, they believe without a doubt that the destination of this journey will be rewarding.  All members feel a sense of pride and seem to have realized the significance of this `,
      },
    },
    good: {
      short: {
        ja: `このワゴンは前に向かって進んでいるようです。`,
        en: `The wagon seems to be moving `,
      },
      detail: {
        ja: `メンバーがしっかりとした旅の目的を持っていて、目的地に見える素晴らしい世界を共有しており、多くのメンバーがこのワゴンの旅に意義を見出しているようです。`,
        en: `Your team understands of the purpose of this trip, there is a shared view of of the destination of the trip being rewarding.  For the most part, your team members have realized the significance of this `,
      },
    },
    average: {
      short: {
        ja: `このワゴンはどこに向かって進んでいるのかやや不明確なようです。`,
        en: `There is some uncertainty about where the wagon is `,
      },
      detail: {
        ja: `メンバーには旅の目的は伝わっているようですが、景色はまだぼんやりとしているようです。このワゴンの旅の一員であることの自覚はまだ薄く、意義を見出している人もいれば、いない人もいるようです。。`,
        en: `Your team understands the purpose of this trip but the landscape is vauge.  There is only a faint sense of self-awareness from everyone on this wagon journey. As there are members who have realized the significance of this journey, there are also members who haven't.`,
      },
    },
    poor: {
      short: {
        ja: `このワゴンはどこに向かって進んでいるのか不明です。`,
        en: `It is unclear where the wagon is `,
      },
      detail: {
        ja: `メンバーが旅の目的を見失っており、行先にあまり良い景色を見出だせていないようです。このワゴンの旅の一員であることに誇りを感じておらず、旅そのものにも意義を感じていないようです。`,
        en: `The members of your team have lost sight of the purpose of this journey,  the beautiful landscape ahead hasn't been noticed.  There's no sense of pride in being a member of the journey and the journey itself doesn't feel `,
      },
    },
    critical: {
      short: {
        ja: `このワゴンはどこに向かって進んでいるのか全く不明です。`,
        en: `It is entirely unclear where the wagon is `,
      },
      detail: {
        ja: `メンバーは旅の行先が見えず嵐が待ち受けているように感じているようです。この旅の一員であることに誇りを感じておらず、反感すら感じているのかもしれません。 旅そのものにも全く意義を感じていないようです。`,
        en: `The members of your team on this journey, without looking ahead, seem to be waiting for a storm.  Theres no sense of pride in being a member of this journey, there might even be a sense of revulsion. It feels as if there is absolutely no significance in this `,
      },
    },
  },
  // 道筋
  road: {
    excellent: {
      short: {
        ja: `このワゴンは舗装したきれいな道を走っており、進みやすそうです。`,
        en: `The wagon is running across a well-paved road and progress is `,
      },
      detail: {
        ja: `ワゴンが進む道はきれいに舗装され、とても進みやすそうです。 途中で障害物があったとしても、みんなで綺麗に道を整えながら、 目的地に向かって勢い良く進んでいるようです。`,
        en: `The wagon is continuing on a smoothly paved road, progression seems easy. Even if obstacles appear along the way everyone can clear the path together.  The team can proceed with great momentum while looking `,
      },
    },
    good: {
      short: {
        ja: `このワゴンは石畳を走っており、進みやすそうです。`,
        en: `The wagon is running across a road paved with flagstones and progress is `,
      },
      detail: {
        ja: `ワゴンが進む道はそれなりに整えられており、進みやすそうです。 メンバーはこの道を進むことで、目的地にたどり着けると思えているようです。`,
        en: `The road the wagon is continuing on is paved accordingly, making it easy to progress.  The members of your team believe that continuing on this road will get everyone to their `,
      },
    },
    average: {
      short: {
        ja: `このワゴンは砂利道を走っており、少し進みにくそうです。`,
        en: `The wagon is running across a gravel road and progress is somewhat `,
      },
      detail: {
        ja: `ワゴンが進む道には砂利が転がっており、少し進みにくそうです。 ベストな道だとは思えておらず、「他にも道があるのではないか」という迷いがありそうです。 「この道を進めば、確実に目的地にたどり着ける」という確信は得られていないようです。。`,
        en: `The road the wagon is continuing on has some gravel, making it a little difficult to progress.  Knowing that this road isn't the best, there are some worries that a different road can be taken.  The members of your team don’t seem convinced that, if they continue on this road, they'll reach their `,
      },
    },
    poor: {
      short: {
        ja: `このワゴンはボコボコな砂地を走っており、進みにくそうです。`,
        en: `The wagon is running across a sand road full of potholes, and progress is `,
      },
      detail: {
        ja: `ワゴンが進む道は、岩がゴロゴロ転がっており進みにくそうです。 多くのメンバーがこの道を進むことに対して納得しておらず、この道を進んでも、目的地に辿り着けそうな気がしていないようです。`,
        en: `The road the wagon is continuing on is covered in loose gravel and is difficult to progress on.  Many members aren't convinced they can progress on this road.  Even if they did progress, they don't feel like they would make it to their `,
      },
    },
    critical: {
      short: {
        ja: `このワゴンは泥沼にはまっており、このままでは動かなくなってしまいそうです。`,
        en: `The wagon is bogged down, and it may become unable to move `,
      },
      detail: {
        ja: `このワゴンは泥沼にハマっており、このままでは立ち往生してしまいそうです。 誰もこの道を進みたいとは思っていないようで、この道を進んでも目的地には到底たどり着けそうにありません。。`,
        en: `The wagon is lodged in some mud, at this rate it looks like it'll get stuck. Nobody wants to continue on this road.  Even if you were to continue on this road, it seems like you wont be able to reach your `,
      },
    },
  },
  // ロープ
  rope: {
    excellent: {
      short: {
        ja: `先頭の人の力はきちんとワゴンに伝わり、ワゴンの振動も先頭の人にきちんと伝わっているようです。`,
        en: `The leader can pull the wagon at full strength and the vibrations of the wagon are transmitted back to the leader `,
      },
      detail: {
        ja: `引っ張る人の意図や考えがメンバー全員に浸透しているようです。 しっかりと目的地を見据え、随時後ろの人に声をかけながら、メンバーとの信頼関係も築けているので、多少の困難があってもロープが切れることはないでしょう。`,
        en: `The thoughts and intentions of the leaders pulling the wagon are reaching all members, everyone is looking towards the destination.  With the members from the back receiving the leader's voice, a sense of trust in the relationship between the leader and members have grown.  Even if the rope is pulled tight, it shouldn't `,
      },
    },
    good: {
      short: {
        ja: `先頭の人の力はワゴンに伝わり、ワゴンの振動も先頭の人に伝わっているようです。`,
        en: `The leader can pull the wagon and the vibrations of the wagon are transmitted back to the `,
      },
      detail: {
        ja: `引っ張る人の意図や考えはメンバーにも伝わってはいるようです。 ロープもピンと張っており、信頼関係も築かれているようなのでワゴンの状態やメンバーの本音も先頭に伝わっているようです。`,
        en: `The thoughts and intentions of the leaders pulling the wagon seem to be reaching members of the team.  The rope is being pulled tight and because a sense of trust in the relationship is growing, the the condition of the wagon and the members' true feelings are being conveyed to the `,
      },
    },
    average: {
      short: {
        ja: `先頭の人の力はワゴンに少し伝わり、ワゴンの振動も先頭の人に少し伝わっているようです。`,
        en: `The leader can pull the wagon to some degree and the vibrations of the wagon are transmitted back to the leader to some `,
      },
      detail: {
        ja: `引っ張る人の意図や考えはメンバーにある程度は伝わっているようです。 ロープには少したるみがあり、先頭の人との心理的な距離もまだあるようなのでワゴンの状態やメンバーの本音を把握できているとはいえないようです。`,
        en: `The thoughts and intentions of the leaders pulling the wagon are reaching the members of the team to some degree.  With some slack in the rope, there seems to be phycological distance from the leaders. There's a chance that the condition of the wagon and the members' true feelings aren't being `,
      },
    },
    poor: {
      short: {
        ja: `先頭の人の力はワゴンに伝わっていません。ワゴンの振動も先頭の人に伝わっていないようです。`,
        en: `The leader cannot pull the wagon properly and the vibrations of the wagon are not transmitted back to the `,
      },
      detail: {
        ja: `引っ張る人の意図や考えはメンバーには伝わっていないようです。 ロープもたるんでおり信頼関係があまり築かれていないので、ワゴンやメンバーの状態は先頭にはほとんど伝わっていないようです。`,
        en: `The thoughts and intentions of the leaders pulling the wagon aren't being conveyed to the members of the team.  A sense of trust in the relationship isn't growing so for the most part the condition of the wagon and team members aren't being conveyed to the `,
      },
    },
    critical: {
      short: {
        ja: `先頭の人の力はワゴンに全く伝わっていません。ワゴンの振動も全く先頭の人に伝わっていないようです。`,
        en: `The leader cannot pull the wagon at all and the vibrations of the wagon are not transmitted back to the leader at `,
      },
      detail: {
        ja: `引っ張る人の意図や考えはメンバーには全く受け入れられていないようです。 ロープも切れており信頼関係も築かれていないので、ワゴンやメンバーの状態は先頭には全く伝わっておらず、ワゴンを引っ張る役割としては機能していないようです。`,
        en: `The thoughts and intentions of the leaders pulling the wagon aren't being accepted at all. The rope has been cut and there's no sense of trust built.  Without the wagon and the members' condition being conveyed to the leaders, the wagon isn't being pulled `,
      },
    },
  },
  // タイヤ
  tire: {
    excellent: {
      short: {
        ja: `ワゴンには新しい丸いタイヤがついており、スムーズに進んでいるようです。`,
        en: `The wagon is outfitted with new round tires and seems to be progressing `,
      },
      detail: {
        ja: `ワゴン自体は旅路の変化に応じて常に新しい道具や情報も共有されているようです。 みんなで主体的に知恵と工夫を出し合って、常に新しい発想で最高の状態で走れるように整備されているようです。`,
        en: `The wagon itself, according to change, can always share new tools and information.  With everyone sharing their wisdom and ideas, there is constant adjustment allowing the wagon to drive under the best `,
      },
    },
    good: {
      short: {
        ja: `ワゴンには丸いタイヤと四角いタイヤがついており、頑張れば進みそうです。`,
        en: `The wagon is outfitted with round and square tires, but could progress with some `,
      },
      detail: {
        ja: `ワゴン自体はこれまでの経験を活かして、旅に必要な道具や情報は共有されているようです。 今は走りやすい状態に整備されているようですが、急な旅路の変化には対応できないこともあるかもしれません。。`,
        en: `The wagon, utilizing its experience until now, can share the tools and information necessary for the journey.  For now, the easiness of this drive is being maintained, but if the journey were to suddenly change course, the wagon might not be able to take corresponding `,
      },
    },
    average: {
      short: {
        ja: `ワゴンには四角いタイヤがついており、少し進みにくそうです。`,
        en: `The wagon is outfitted with square tires and seems like it has some difficulty `,
      },
      detail: {
        ja: `ワゴン自体は過去の経験に縛られ古い道具や慣習にとらわれているため、四角いタイヤのまま走っているようです。 メンバーも四角いタイヤになっていることにすら気がついていない可能性があり、必要以上に体力を消耗しているかもしれません。`,
        en: `The wagon itself in tied up in its past experiences, because its caught up in old tools and customs, the wagon is running on square tires.  There's a chance the members haven't realized the tires have become square and are exhausting their physical `,
      },
    },
    poor: {
      short: {
        ja: `ワゴンのタイヤの一部に古い三角のタイヤがついており、進みにくいようです。`,
        en: `Some of the tires are old and triangular, and the wagon looks like it is having difficulty `,
      },
      detail: {
        ja: `ワゴン自体は長い間整備を怠っており、古い道具や慣習にとらわれているため、かなりボロボロの状態です。 メンバーもこのままでは前に進まないと思っており、整備しようとしないことに危機感を感じているかもしれません。`,
        en: `The wagon itself has neglected maintenance. Because its caught up in old tools and customs, its considerably tatterd.  The members also don't think they can continue like this, there might be a sense of crisis because of nobody trying to keep the wagon `,
      },
    },
    critical: {
      short: {
        ja: `ワゴンには古い三角のタイヤがついており、このままでは進めるのが難しいようです。`,
        en: `The wagon is outfitted with old triangular tires and seems unable to `,
      },
      detail: {
        ja: `このワゴンは今までの古い道具や慣習ではうまくいかないことに気づいていながら長い間放置してきたようです。 メンバーもこのワゴンを整備することを諦めてしまっており、この状態では、ワゴンが壊れてしまうかもしれません。`,
        en: `The wagon, knowing the old tools and customs won't work well, has still left everything alone.  Even the members have given up on the wagon's maintenance and at this rate the wagon might `,
      },
    },
  },
  // 押す人の体
  body: {
    excellent: {
      short: {
        ja: `ワゴンを押す人たちは力を最大限発揮しており、このワゴンの前進に大きく貢献しています。`,
        en: `People are putting a great deal of strength into pushing the wagon and it greatly contribute to the wagon's `,
      },
      detail: {
        ja: `メンバーにとっては、この旅が自分の成長につながると確信しており、旅を通じて貪欲に成長しようとしているようです。 いつも自分たちの能力を余すことなく発揮しているので、ワゴンを力強く押すことが出来ているようです。`,
        en: `For the members of your team, they believe this trip is connected to their personal growth, through this journey they are avidly trying to improve themselves.  Because all the members are demonstrating their strength without holding back, they can powerfully push the `,
      },
    },
    good: {
      short: {
        ja: `ワゴンを押す人たちは力強くワゴンを押しており、このワゴンの前進に貢献しているようです。`,
        en: `People are putting a lot of strength into pushing the wagon and seem to be contributing to the wagon’s `,
      },
      detail: {
        ja: `メンバーにとっては、この旅を続けるために必要な成長の機会があり、その機会を活かしていると感じているようです。 ただ、まだ自分の強みや得意なことをこの旅に十分に活かしきれていないかもしれません。`,
        en: `For the members of your team, there's an oportunity for growth that is necessary to continue this journey.  The members are able to take advantage of the oportunity. However, they aren't fully utilizing their strengths and specialties for this trip `,
      },
    },
    average: {
      short: {
        ja: `ワゴンを押す人たちは普通の力で押しており、このワゴンの前進に少し貢献しているようです。`,
        en: `People are putting only an average amount of strength into pushing the wagon and seem to be contributing only somewhat to the wagon’s `,
      },
      detail: {
        ja: `メンバーにとっては、この旅を続けるために必要な成長の機会を十分に得られないと感じているようです。 まだ自分の強みや得意なことを把握できていないため、この旅を通じて成長している実感をあまり感じていないかもしれません。`,
        en: `For the members of your team, they don't think there's enough oportunity for growth to continue this trip.  Because they can't grasp their own strengths and skills, they don't have a feeling of actual growth from this `,
      },
    },
    poor: {
      short: {
        ja: `ワゴンを押す人たちはあまり力を発揮しておらず、このワゴンの前進にあまり貢献していないようです。`,
        en: `People are not putting enough strength into pushing the wagon and do not seem to be contributing much to the wagon’s `,
      },
      detail: {
        ja: `メンバーにとっては、この旅の中で成長の機会があると感じていないようです。 自分の能力にも自信がないため、このワゴンの前進に役に立っている実感も持てていないようです。`,
        en: `For the members of your team, they don't feel there's an oportunity for growth along this journey.  Because theres no confidence in their personal strengths, they feel like they don't really have an impact on the wagon's `,
      },
    },
    critical: {
      short: {
        ja: `ワゴンを押す人たちは全く力を発揮しておらず、ワゴンの前進に全く貢献していないようです。`,
        en: `People are putting no strength at all into pushing the wagon and do not seem to be contributing to the wagon’s progress at `,
      },
      detail: {
        ja: `メンバーにとっては、能力を発揮する機会も成長を実感する機会もないため、意欲がなくなっているようです。 むしろこの旅に参加することで、自分が退化していると感じているかもしれません。 ワゴンの前進には全く役に立てていないと感じているようです。`,
        en: `For the members of your team, because they don't have an oportunity to demonstrate their abilities or feel growth, they have lost motivation.  Members might even feel worse by participating in this journey, it feels like they have absolutely no impact on the progression of the `,
      },
    },
  },
  // 押す人の顔
  attitude: {
    excellent: {
      short: {
        ja: `ワゴンを押す人たちの士気はとても高いようです。みんな笑顔でワゴンを押しています。`,
        en: `Morale of the people pushing the wagon seems very high. They are all pushing with smiles on their `,
      },
      detail: {
        ja: `みんながお互いに認め合い、協力しあいながら切磋琢磨しているので、とても活力に溢れていて雰囲気もいいようです。`,
        en: `Everyone understands and recognizes each other, they are working hard and applying themselves deligently which allows for an overflow of energy in the `,
      },
    },
    good: {
      short: {
        ja: `ワゴンを押す人たちの士気は高いようです。みんな真面目にワゴンを押しています。`,
        en: `Morale of the people pushing the wagon seems high. They are all doing their best to `,
      },
      detail: {
        ja: `みんながお互いに関わり合い、人となりも理解されているので、この旅に自分が必要とされている実感を持つことができているようです。。`,
        en: `Everyone is interacting with and comprehending each other, therefore members feel like they are needed for this `,
      },
    },
    average: {
      short: {
        ja: `ワゴンを押す人たちの士気は高くも低くもないようです。みんな普通にワゴンを押しています。`,
        en: `Morale of the people pushing the wagon seems average. They are putting an average amount of effort into pushing the `,
      },
      detail: {
        ja: `みんながお互いに関わり合っているようですが、旅での経験や感じたことの共有は浅いため、一人ひとりはこの旅での存在感を感じられていないかもしれません。`,
        en: `It seems like everyone is interacting with each other but shared feelings and experiences on this jorney are shallow.  Because of that, people don't feel like they have an individual presence in this `,
      },
    },
    poor: {
      short: {
        ja: `ワゴンを押す人たちの士気は低いようです。ワゴンを押すことに集中していないようです。`,
        en: `Morale of the people pushing the wagon seems low. They do not seem very focused on pushing the `,
      },
      detail: {
        ja: `みんなのお互いの関わり合いがほとんど無く、旅での経験や感じたことの共有が足りないようです。一緒に旅をすることの意義を感じておらず、孤独を感じているかもしれません。`,
        en: `Nobody is interacting with each other and it feels like there isn't enough shared feeling or experience on this journey.  Without feeling any significance in traveling together, members might be feeling `,
      },
    },
    critical: {
      short: {
        ja: `ワゴンを押す人たちに士気はないようです。ワゴンを押すことが辛そうです。`,
        en: `Morale of the people pushing the wagon seems extremely low. They seem to find it very difficult to push the `,
      },
      detail: {
        ja: `みんながお互いに無関心でまったく協力もしようとせず この旅に対して後ろ向きのため、雰囲気は最悪のようです。`,
        en: `Everyone is indifferent  and not willing to cooperate with each other.  Because of this backwards thinking on the journey, the group's atmosphere is the absolute `,
      },
    },
  },
  // 積荷
  cargo: {
    excellent: {
      short: {
        ja: `ワゴンには多様なタイヤやジェットエンジンが積まれており、どのような環境にも対応できそうです。`,
        en: `The wagon contains many things from tires to jet engines, and it looks equipped to deal with any `,
      },
      detail: {
        ja: `常に丸いタイヤや新たな可能性を秘めた材料を旅をしながら仕入れており、必要に応じて自分たちで自由に使いこなすことができているようです。`,
        en: `There is always a collection of round tires and new materials in case of unexpected changes while on this journey.  You all can freely handle whatever comes your way depending on what's `,
      },
    },
    good: {
      short: {
        ja: `ワゴンには丸いタイヤがたくさん積まれており、いつでも交換可能なようです。`,
        en: `The wagon contains many round tires, and it looks like any broken tires could be replaced `,
      },
      detail: {
        ja: `たくさんの丸いタイヤが積まれており、もっと早く目的地にたどりつくために丸いタイヤが活用され始めているようです。`,
        en: `There's a bunch of round tires stacked up, to reach your destination faster, the tires are beginning to be `,
      },
    },
    average: {
      short: {
        ja: `ワゴンには丸いタイヤが少し積まれており、必要に応じて交換できそうです。`,
        en: `The wagon contains some round tires, and it looks like broken tires could be replaced if really `,
      },
      detail: {
        ja: `いくつかの丸いタイヤが積まれていることにメンバーは気づいているようですが、それらの丸いタイヤを上手く使いこなすことがまだできていないようです。`,
        en: `The members seem to have noticed some round tires stacked up, but can't seem to use these round tires skillfully `,
      },
    },
    poor: {
      short: {
        ja: `ワゴンには丸いタイヤが一部しか積まれてないようです。タイヤの交換を間違えると進まないかもしれません。`,
        en: `The wagon contains only a few round tires. The wagon might get stuck if mistakes are made while changing the `,
      },
      detail: {
        ja: `旅の状況には適さない三角や四角いタイヤもたくさん積まれているようです。 これまでの慣習や考え方に縛られていて、丸いタイヤを見つけようとしていないのかもしれません。`,
        en: `There's a lot of triangular and square tires piled up which are not suitable for this journey's current situation.  Stuck on the customs and ways of thought up until now, there might not be anybody looking for round `,
      },
    },
    critical: {
      short: {
        ja: `ワゴンには古いタイヤしかないようです。タイヤを交換しても効果は期待できそうにありません。`,
        en: `The wagon contains only old tires. Changing the tires would not make things go more `,
      },
      detail: {
        ja: `古くて使いものにならないタイヤがいっぱいで重荷にしかなっていないようです。 ワゴンをより良くしようとすることに関心がないので、丸いタイヤを見つけようとすらしていないようです。`,
        en: `There's so many old unusable tires that they're only dead weight.  Theres no interest in improving the wagon, so nobody is trying to find new round `,
      },
    },
  },
  // 多様性
  diversity: {
    excellent: {
      short: {
        ja: `このワゴンはお互いの能力や特徴を上手に活かし合っているようです。`,
        en: `The wagon is making great use of everyone's abilities and `,
      },
      detail: {
        ja: `この旅では、いろんな能力や特徴を持った人たちが十分に力を発揮し活かし合っているので、常に新しい発見や工夫に満ちているようです。`,
        en: `There are people with abilities and characteristics on this journey that can fully utilize and make good use of their power.  This journey is full of new discovery and `,
      },
    },
    good: {
      short: {
        ja: `このワゴンはお互いの能力や特徴をそれなりに活かしているようです。`,
        en: `The wagon is making good use of everyone's abilities and `,
      },
      detail: {
        ja: `この旅では、お互いの能力や特徴をそれなりに発揮され活かし合っているので、新たな発見や工夫が生まれているようです。`,
        en: `On this journey, the abilities and characteristics of each individual are being somewhat utilized and made good use of, so new discoveries and solutions are being `,
      },
    },
    average: {
      short: {
        ja: `このワゴンはお互いの能力や特徴を十分に認識できてないようです。`,
        en: `The wagon isn't making good use of the abilities and characteristics of everyone.`,
      },
      detail: {
        ja: `この旅では、お互いの能力や特徴がまだ十分に認識できていないため、まだまだ新たな発見や工夫ができる余地がありそうです。`,
        en: `Because each individual's abilities and characteristics aren't fully understood yet, there's still some room for more new discoveries and solutions to be `,
      },
    },
    poor: {
      short: {
        ja: `このワゴンはお互いの能力や特徴を活かし合おうとしてないようです。`,
        en: `The wagon isn't quite attempting to make use of everyone's abilities and `,
      },
      detail: {
        ja: `この旅では、お互いの能力や特徴を活かし合おうとはしていないため、あまり新たな発見や工夫は生まれていないようです。`,
        en: `Because nobody is trying to make good use of each other's abilities and characteristics, there aren't many new discoveries and solutions are being `,
      },
    },
    critical: {
      short: {
        ja: `このワゴンはお互いの能力や特徴が何も活かされてないようです。`,
        en: `The wagon isn't making use of anyones abilities or `,
      },
      detail: {
        ja: `この旅では、お互いに干渉しようとせず活かし合おうともしていないため、新たな発見や工夫はほとんど生まれていないようです。`,
        en: `Because nobody is trying to interfere with one another or trying to make good use of each other, theres almost no new discoveries or solutions being `,
      },
    },
  },
  // 幸福度
  happiness: {
    excellent: {
      short: {
        ja: `あなたのチームメンバーは、このチームで働いていて、とても幸せなようです。`,
        en: `Your team members seem very happy to be working in this `,
      },
      detail: {
        ja: `みんながこの旅にとても幸せを感じているようです。`,
        en: `Everyone feels happiness on this `,
      },
    },
    good: {
      short: {
        ja: `あなたのチームメンバーのほとんどが、このチームで働いていて、幸せなようです。`,
        en: `Most of your team members seem happy to be working in this `,
      },
      detail: {
        ja: `ほとんどの人が、この旅に幸せを感じているようです。`,
        en: `Most people feel happy on this `,
      },
    },
    average: {
      short: {
        ja: `あなたのチームメンバーは、このチームで働いていて、まだ少し幸せを感じる度合いが低いようです。`,
        en: `Your team members do not seem as happy as they could be to be working in this `,
      },
      detail: {
        ja: `この旅に幸せを感じている人もいれば、そうでない人もいるようです。`,
        en: `There are people who feel happy on this journey, but there are also those who don't.`,
      },
    },
    poor: {
      short: {
        ja: `あなたのチームメンバーは、このチームで働いていて、あまり幸せを感じていないようです。`,
        en: `Your team members do not seem very happy to be working in this `,
      },
      detail: {
        ja: `この旅に幸せを感じている人は少ないようです。`,
        en: `Not many people feel happy on this `,
      },
    },
    critical: {
      short: {
        ja: `あなたのチームメンバーのほとんどが、このチームで働いていて、幸せを感じていないようです。`,
        en: `Most of your team members seem unhappy to be working in this `,
      },
      detail: {
        ja: `ほとんどの人が、この旅に幸せを感じていないようです。`,
        en: `Most people don't feel happy on this `,
      },
    },
  },
};

/** スコアからコメントを取得するヘルパー */
export function getComment(
  category: Exclude<QuestionCategory, "management">,
  level: ScaleLevel
): CategoryComment {
  return COMMENTS[category][level];
}
