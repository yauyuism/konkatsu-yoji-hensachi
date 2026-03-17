import type { Situation } from "@/data/weight";
import { roundTo1 } from "@/lib/text-analysis";
import type { WeightTopFactor } from "@/lib/weight-types";

export function getGenericComment(weight: number, topFactor: WeightTopFactor) {
  if (weight <= 1.3) {
    return `${weight}kg。軽い。相手が物足りなく感じてる可能性がある。たまには自分から話題を出してみて。「軽い」も「重い」と同じくらいリスクがある。`;
  }

  if (weight <= 2.2) {
    return `${weight}kg。ちょうどいいゾーン。このバランスを維持して。崩れやすいのは「相手が好き」と確信したとき。温度が上がると重量も上がる。`;
  }

  if (weight <= 3.5) {
    return `${weight}kg。やや重め。一番の原因は${topFactor.name}（+${topFactor.weight}kg）。この1項目だけ意識すれば2kg台に戻れる。全部直す必要はない。`;
  }

  return `${weight}kg。重い。でも「重い自覚がある人」は直せる。一番効くのは${topFactor.name}を減らすこと。次のメッセージから1つだけ意識してみて。`;
}

export function getComment(
  situation: Situation,
  weight: number,
  partnerWeight: number,
  topFactor: WeightTopFactor
) {
  const diff = roundTo1(weight - partnerWeight);

  switch (situation) {
    case "more_than_friends":
      if (weight > 2.8) {
        return `友達以上恋人未満で${weight}kg。もう「恋人未満」じゃない。気持ちがLINEに出てる。相手も気づいてる。このまま重いまま行くか、一回言葉にするか。`;
      }
      if (weight < 1.0) {
        return `${weight}kg。友達以上のはずなのに友達以下の重量。「好きだと悟られたくない」が出すぎてる。もう少し出していい。`;
      }
      if (diff > 1.5) {
        return `重量差${diff}kg。あなたのほうが重い。この関係に名前がつかない理由、たぶんこの重量差にある。相手はこの距離感が心地いい。あなたはもっと近づきたい。`;
      }
      if (diff < -1.0) {
        return `相手のほうが${Math.abs(diff)}kg重い。相手はあなたに気がある可能性。あなたが距離を決めてる側。`;
      }
      return `${weight}kg。この関係にしてはバランスが取れてる。でも「バランスが取れてる友達以上」は、どっちかが我慢してることが多い。`;

    case "crush":
      if (weight > 2.2) {
        return `片思いで${weight}kgは重い。一番の原因は${topFactor.name}（+${topFactor.weight}kg）。気持ちは分かるけど、半分に抑えてちょうどいい。`;
      }
      if (diff > 1.5) {
        return `重量差${diff}kg。片思いなら当然の差。問題は、この差が相手に伝わってるかどうか。伝わってて返信が続いてるなら脈あり。`;
      }
      if (Math.abs(diff) < 0.5) {
        return `重量差${Math.abs(diff)}kg。ほぼ均等。片思いなのに重量が揃ってるのは良い兆候。相手もあなたに同じくらい関心がある可能性。`;
      }
      return `${weight}kg。片思いとしては適正範囲。この重さを維持しながら、どこかで「会おう」を入れて。LINEだけでは進まない。`;

    case "ex":
      if (weight > 2.0) {
        return `元カレ/元カノに${weight}kg。LINEの重量的に言うと、未練がある。それが悪いわけじゃない。ただ自覚はしておいたほうがいい。`;
      }
      if (weight < 0.8 && partnerWeight < 0.8) {
        return `お互い${weight}kgと${partnerWeight}kg。ほぼ業務連絡。「連絡取ってる」のうちに入らない。健全。`;
      }
      if (diff < -1.0) {
        return `あなたは${weight}kgで相手は${partnerWeight}kg。相手のほうが重い。向こうに未練がある可能性。あなたの返信ペースが相手の気持ちをコントロールしてる状態。`;
      }
      return `${weight}kg。元カレ/元カノとの連絡としては微妙なゾーン。友達になれてるなら問題ないけど、新しい恋を探してるなら、このLINEに使ってる時間を別に回したほうがいい。`;

    case "complicated":
      if (diff > 2.0) {
        return `重量差${diff}kg。「複雑な関係」の正体は、この重量差にある。片方が圧倒的に重い関係は、どこかで破綻する。数字で見ると冷静になれる。`;
      }
      if (Math.abs(diff) < 0.5) {
        return `重量差${Math.abs(diff)}kg。複雑な割にメッセージのバランスは取れてる。複雑なのは関係であって、コミュニケーションではないのかもしれない。`;
      }
      return `${weight}kg。「複雑な関係」を選んだ時点で、たぶん答えは出てる。この重量が楽しいなら続けていい。しんどいなら数字を理由にして離れていい。`;

    case "dating":
      if (diff > 2.0) {
        return `重量差${diff}kg。付き合ってるのにこの差は大きい。「好き」の重量差じゃなくて「連絡のマメさ」の差かも。2人で結果を見せ合ってみて。`;
      }
      if (weight < 1.2 && partnerWeight < 1.2) {
        return `2人とも軽い。安定してるとも言えるけど、「最近LINE減ったな」と思ってるならここが原因。週1回だけ、用事じゃないLINEを送ってみて。`;
      }
      return `${weight}kg。恋人としてはちょうどいいゾーン。この重量を維持して。`;

    case "living_together":
      if (weight > 2.5) {
        return `一緒に住んでて${weight}kg。「直接言えばいいことをLINEで送ってる」可能性。隣にいるのにLINE、してない？`;
      }
      if (weight < 0.8 && partnerWeight < 0.8) {
        return `お互い1kg以下。業務連絡オンリー。一緒にいるから当然かもしれないけど、たまには「隣にいるのにあえてLINE」してみて。意外と新鮮。`;
      }
      if (diff > 1.5) {
        return `重量差${diff}kg。片方だけが家のLINEを回してる。これ、家事の偏りと同じ構造。見せ合って話してみて。`;
      }
      return `${weight}kg。一緒に暮らしてる関係としては自然な重量。`;

    case "app_match":
      if (weight > 2.5) {
        return `まだ数通のやりとりで${weight}kgは重い。一番の原因は${topFactor.name}。半分に減らすだけでちょうどよくなる。`;
      }
      if (weight < 1.0) {
        return `${weight}kg。軽い。マッチしたのに淡白すぎると「興味ないのかな」と思われる。もう少し自分の話題を出していい。`;
      }
      return `${weight}kg。この段階では適正。今のペースで。`;

    case "going_well":
      if (weight > 3.0) {
        return `${weight}kg。いい感じの段階でこの重量、気持ちが先走ってる。相手のメッセージの長さに合わせるだけで自然に調整できる。`;
      }
      return `${weight}kg。いい感じ。このまま。`;

    default:
      return getGenericComment(weight, topFactor);
  }
}
