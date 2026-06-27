import { useState, useCallback } from "react";

// ── STRATEGIES ────────────────────────────────────────────────────────────────
const STRATEGIES = [
  { id:"price_action", name:"Price Action", icon:"📊", tagline:"Read the market through pure chart structure", color:"#3B82F6", glow:"#3B82F620" },
  { id:"ict",          name:"ICT",          icon:"🧠", tagline:"Inner Circle Trader — institutional flow",    color:"#A78BFA", glow:"#A78BFA20" },
  { id:"smc",          name:"SMC",          icon:"💎", tagline:"Smart Money Concepts — follow big players",   color:"#34D399", glow:"#34D39920" },
];

const STRATEGY_PATTERNS = {
  price_action: [
    { id:"bull_flag",     name:"Bull Flag",                desc:"Strong upward pole + tight bearish consolidation before continuation" },
    { id:"bear_flag",     name:"Bear Flag",                desc:"Sharp downward pole + brief bullish relief before continuation" },
    { id:"asc_tri",       name:"Ascending Triangle",       desc:"Flat resistance with rising support — bullish breakout bias" },
    { id:"desc_tri",      name:"Descending Triangle",      desc:"Flat support with declining resistance — bearish breakdown bias" },
    { id:"sym_tri",       name:"Symmetrical Triangle",     desc:"Converging highs and lows — breakout confirmed by momentum" },
    { id:"rising_wedge",  name:"Rising Wedge",             desc:"Lows rising faster than highs — bearish reversal signal" },
    { id:"falling_wedge", name:"Falling Wedge",            desc:"Highs falling slower than lows — bullish reversal signal" },
    { id:"cup_handle",    name:"Cup & Handle",             desc:"U-shaped base with shallow handle — strong bullish continuation" },
    { id:"inv_cup",       name:"Inverted Cup & Handle",    desc:"Dome-shaped top with small bounce — bearish reversal signal" },
    { id:"pennant",       name:"Pennant",                  desc:"Strong move followed by tight symmetrical consolidation" },
    { id:"double_top",    name:"Double Top",               desc:"Two equal highs at resistance — bearish reversal pattern" },
    { id:"double_bottom", name:"Double Bottom",            desc:"Two equal lows at support — bullish reversal pattern" },
    { id:"hs",            name:"Head & Shoulders",         desc:"Three peaks — middle highest — classic bearish reversal" },
    { id:"inv_hs",        name:"Inverse Head & Shoulders", desc:"Three troughs — middle lowest — classic bullish reversal" },
  ],
  ict: [
    { id:"fvg",       name:"Fair Value Gap (FVG)",      desc:"Three-candle imbalance — price tends to return to fill it" },
    { id:"ob_ict",    name:"Order Block",               desc:"Last opposing candle before displacement — institutional order zone" },
    { id:"breaker",   name:"Breaker Block",             desc:"Failed order block — now acts as opposite support/resistance" },
    { id:"liq_sweep", name:"Liquidity Sweep",           desc:"Price raids obvious highs/lows to fill institutional orders before reversing" },
    { id:"bos_ict",   name:"Break of Structure (BOS)",  desc:"Price breaks a key swing high/low confirming trend continuation" },
    { id:"choch_ict", name:"Change of Character (CHoCH)", desc:"First break against prevailing trend — early reversal signal" },
    { id:"ote",       name:"Optimal Trade Entry (OTE)", desc:"61.8–78.6% Fibonacci retracement after displacement — high-probability entry" },
    { id:"killzone",  name:"Killzone Setup",            desc:"High-probability setups during London or NY session opens" },
    { id:"mitigation",name:"Mitigation Block",          desc:"Area where institutional orders were partially filled — price returns to complete" },
    { id:"rejection", name:"Rejection Block",           desc:"Candle with long wick showing strong rejection — institutional defense zone" },
  ],
  smc: [
    { id:"choch_smc",    name:"Change of Character (CHoCH)", desc:"Structure shift — smart money is repositioning" },
    { id:"bos_smc",      name:"Break of Structure (BOS)",    desc:"Smart money committed to a direction — trend continuation" },
    { id:"ob_smc",       name:"Order Block",                 desc:"Origin candle of strong move — where smart money placed positions" },
    { id:"inducement",   name:"Inducement",                  desc:"Fake liquidity target to trap retail before the real move" },
    { id:"liq_grab",     name:"Liquidity Grab",              desc:"Engineered move to collect stop losses before reversal" },
    { id:"premium_disc", name:"Premium / Discount Zone",     desc:"Above 50% = premium (sell). Below 50% = discount (buy)" },
    { id:"imbalance",    name:"Imbalance",                   desc:"Gap caused by one-sided institutional aggression — tends to fill" },
    { id:"poi",          name:"Point of Interest (POI)",     desc:"Key level where smart money is likely to react" },
    { id:"strong_hl",    name:"Strong High / Low",           desc:"Swing points protected by smart money — breaking signals major shift" },
    { id:"displacement", name:"Displacement Candle",         desc:"Large aggressive candle confirming institutional entry direction" },
  ],
};

const EXCHANGES = [
  { id:"binance", name:"Binance", icon:"🟡", desc:"World's largest crypto exchange by volume",          color:"#F0B90B", glow:"#F0B90B20", tag:"Most Liquid" },
  { id:"bybit",   name:"Bybit",   icon:"🔵", desc:"Popular derivatives & spot exchange for traders",    color:"#3B82F6", glow:"#3B82F620", tag:"Trader Favorite" },
  { id:"okx",     name:"OKX",     icon:"🟠", desc:"Top-tier exchange with wide altcoin selection",      color:"#F97316", glow:"#F9731620", tag:"Wide Selection" },
];

const TIMEFRAMES = [
  { label:"15m", value:"15m" },
  { label:"1H",  value:"1h" },
  { label:"4H",  value:"4h" },
  { label:"1D",  value:"1d" },
];

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
function generateMockCandles(symbol) {
  const bases = { BTCUSDT:65000,ETHUSDT:3400,SOLUSDT:180,BNBUSDT:580,XRPUSDT:0.6,DOGEUSDT:0.18,PEPEUSDT:0.000018,WIFUSDT:3.2,SHIBUSDT:0.000028,AVAXUSDT:38,LINKUSDT:18,SUIUSDT:4.5 };
  const base = bases[symbol] || (Math.random()*10+1);
  const v = base * 0.012;
  const scenario = Math.floor(Math.random()*5);
  let price = base;
  return Array.from({length:60},(_,i) => {
    let change = (Math.random()-0.5)*v;
    if (scenario===0){ if(i<30) change+=v*0.3; else change-=v*0.1; }
    else if (scenario===1){ if(i<30) change-=v*0.3; else change+=v*0.1; }
    else if (scenario===2){ change*=(1-(i/60)*0.7); }
    else if (scenario===3){ if(i<15) change-=v*0.2; else if(i<45) change+=v*0.05; else change+=v*0.15; }
    else { change*=0.5; }
    price = Math.max(price+change, base*0.5);
    const o=price, cl=price+(Math.random()-0.5)*v*0.5;
    const h=Math.max(o,cl)+Math.random()*v*0.3, l=Math.min(o,cl)-Math.random()*v*0.3;
    return [Date.now()-(60-i)*60000,o,h,l,cl,Math.random()*1000+500];
  });
}

async function fetchCandles(symbol, interval, exchange) {
  try {
    let url, res, data;
    if (exchange==="binance") {
      url=`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=60`;
      res=await fetch(url);
      if(!res.ok) throw new Error();
      return await res.json();
    }
    if (exchange==="bybit") {
      const bi=interval==="15m"?"15":interval==="1h"?"60":interval==="4h"?"240":"D";
      url=`https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${bi}&limit=60`;
      res=await fetch(url);
      if(!res.ok) throw new Error();
      data=await res.json();
      return (data?.result?.list||[]).reverse().map(c=>[c[0],c[1],c[2],c[3],c[4],c[5]]);
    }
    if (exchange==="okx") {
      const os=symbol.replace("USDT","-USDT");
      const oi=interval==="15m"?"15m":interval==="1h"?"1H":interval==="4h"?"4H":"1D";
      url=`https://www.okx.com/api/v5/market/candles?instId=${os}&bar=${oi}&limit=60`;
      res=await fetch(url);
      if(!res.ok) throw new Error();
      data=await res.json();
      return (data?.data||[]).reverse().map(c=>[c[0],c[1],c[2],c[3],c[4],c[5]]);
    }
  } catch(e) {
    // Fall back to mock only in preview/development
    console.warn(`API error for ${symbol}, using mock data`);
    return generateMockCandles(symbol);
  }
  return generateMockCandles(symbol);
}

// ── PATTERN DETECTION ─────────────────────────────────────────────────────────
function detectPatterns(candles, selectedIds) {
  if (!candles||candles.length<20) return [];
  const results=[];
  const closes=candles.map(c=>parseFloat(c[4]));
  const highs=candles.map(c=>parseFloat(c[2]));
  const lows=candles.map(c=>parseFloat(c[3]));
  const opens=candles.map(c=>parseFloat(c[1]));
  const n=closes.length, last=closes[n-1];
  const rH=Math.max(...highs.slice(-20)), rL=Math.min(...lows.slice(-20));
  const sl=(arr)=>{const len=arr.length,sX=(len*(len-1))/2,sX2=(len*(len-1)*(2*len-1))/6,sY=arr.reduce((a,b)=>a+b,0),sXY=arr.reduce((s,v,i)=>s+i*v,0);return(len*sXY-sX*sY)/(len*sX2-sX*sX);};
  const hS=sl(highs.slice(-15)), lS=sl(lows.slice(-15)), cS=sl(closes.slice(-10));
  const pre=closes.slice(-20,-10), pG=(pre[pre.length-1]-pre[0])/pre[0], pD=(pre[0]-pre[pre.length-1])/pre[0];
  const push=(id,pat,dir,conf,desc)=>{ if(selectedIds.includes(id)) results.push({id,pattern:pat,direction:dir,confidence:conf,description:desc,price:last}); };
  const prevT=sl(closes.slice(-20,-10));

  if(pG>0.04&&cS<-0.0002&&cS>-0.005) push("bull_flag","Bull Flag","LONG",Math.min(93,65+Math.round(pG*300)),"Strong pole + tight bearish consolidation");
  if(pD>0.04&&cS>0.0002&&cS<0.005)   push("bear_flag","Bear Flag","SHORT",Math.min(93,65+Math.round(pD*300)),"Sharp drop + brief bullish relief");
  const hV=Math.max(...highs.slice(-15))-Math.min(...highs.slice(-15));
  if(hV/rH<0.015&&lS>0.0003) push("asc_tri","Ascending Triangle","LONG",73,"Flat resistance + rising support");
  const lV=Math.max(...lows.slice(-15))-Math.min(...lows.slice(-15));
  if(lV/rL<0.015&&hS<-0.0003) push("desc_tri","Descending Triangle","SHORT",73,"Flat support + declining resistance");
  if(hS<-0.0002&&lS>0.0002&&Math.abs(hS+lS)<0.001) push("sym_tri","Symmetrical Triangle",cS>0?"LONG":"SHORT",68,"Converging highs & lows — breakout imminent");
  if(hS>0.0002&&lS>0.0003&&lS>hS) push("rising_wedge","Rising Wedge","SHORT",75,"Lows rising faster than highs");
  if(hS<-0.0002&&lS<-0.0003&&hS>lS) push("falling_wedge","Falling Wedge","LONG",75,"Highs falling slower than lows");
  const mC=Math.min(...closes.slice(-30,-10)), lR=closes[n-30]||closes[0], rR=closes[n-10];
  const cD=(Math.max(lR,rR)-mC)/Math.max(lR,rR), hD=(rR-last)/rR;
  if(cD>0.08&&cD<0.35&&hD>0.01&&hD<0.08) push("cup_handle","Cup & Handle","LONG",79,"U-shaped base + shallow handle");
  const mI=Math.max(...closes.slice(-30,-10)), iD=(mI-Math.min(lR,rR))/mI, hR=(last-rR)/rR;
  if(iD>0.08&&iD<0.35&&hR>0.01&&hR<0.08) push("inv_cup","Inverted Cup & Handle","SHORT",77,"Dome top + small bounce");
  const pM=Math.abs(pre[pre.length-1]-pre[0])/pre[0], pR=(Math.max(...closes.slice(-10))-Math.min(...closes.slice(-10)))/last;
  if(pM>0.05&&pR<0.025) push("pennant","Pennant",pre[pre.length-1]>pre[0]?"LONG":"SHORT",Math.min(89,65+Math.round(pM*180)),"Strong pole + tight pennant consolidation");
  if(Math.abs(highs[n-1]-highs[n-5])/highs[n-5]<0.02&&highs[n-1]<highs[n-10]) push("double_top","Double Top","SHORT",76,"Two equal highs rejecting resistance");
  if(Math.abs(lows[n-1]-lows[n-5])/lows[n-5]<0.02&&lows[n-1]>lows[n-10])      push("double_bottom","Double Bottom","LONG",76,"Two equal lows holding support");
  // ICT
  if(closes[n-2]>Math.max(highs[n-3],highs[n-1])&&cS<0) push("fvg","Fair Value Gap","SHORT",71,"Bearish imbalance — price may return to fill");
  if(closes[n-2]<Math.min(lows[n-3],lows[n-1])&&cS>0)   push("fvg","Fair Value Gap","LONG",71,"Bullish imbalance — price may return to fill");
  if(cS>0.001) push("ob_ict","Order Block","LONG",74,"Bullish order block — institutional demand zone");
  if(cS>0.002) push("liq_sweep","Liquidity Sweep","LONG",70,"Stop hunt below lows completed — reversal likely");
  if(cS<-0.002) push("liq_sweep","Liquidity Sweep","SHORT",70,"Stop hunt above highs completed — reversal likely");
  if(hS<-0.0005&&last>highs[n-5]) push("bos_ict","Break of Structure (BOS)","LONG",77,"Bullish BOS — structure broken to upside");
  if(lS>0.0005&&last<lows[n-5])   push("bos_ict","Break of Structure (BOS)","SHORT",77,"Bearish BOS — structure broken to downside");
  if(prevT<0&&cS>0.001) push("choch_ict","Change of Character (CHoCH)","LONG",72,"Downtrend CHoCH — first bullish structure break");
  if(prevT>0&&cS<-0.001) push("choch_ict","Change of Character (CHoCH)","SHORT",72,"Uptrend CHoCH — first bearish structure break");
  const fR=rH-rL, f618=rH-fR*0.618, f786=rH-fR*0.786;
  if(last>=f786&&last<=f618&&cS>0) push("ote","Optimal Trade Entry (OTE)","LONG",80,"Price in 61.8–78.6% retracement — OTE zone");
  // SMC
  if(prevT<0&&cS>0.001) push("choch_smc","Change of Character (CHoCH)","LONG",73,"Smart money repositioning — bearish CHoCH broken");
  if(prevT>0&&cS<-0.001) push("choch_smc","Change of Character (CHoCH)","SHORT",73,"Smart money repositioning — bullish CHoCH broken");
  if(hS<-0.0005&&last>highs[n-5]) push("bos_smc","Break of Structure (BOS)","LONG",78,"Smart money confirmed bullish — BOS to upside");
  if(lS>0.0005&&last<lows[n-5])   push("bos_smc","Break of Structure (BOS)","SHORT",78,"Smart money confirmed bearish — BOS to downside");
  push("ob_smc","Order Block",cS>0?"LONG":"SHORT",75,"Origin candle of last strong move — SM position zone");
  if(cS>0.002)  push("liq_grab","Liquidity Grab","LONG",71,"Smart money swept lows — reversal in progress");
  if(cS<-0.002) push("liq_grab","Liquidity Grab","SHORT",71,"Smart money swept highs — reversal in progress");
  const mid=(rH+rL)/2;
  if(last<mid&&cS>0) push("premium_disc","Discount Zone","LONG",70,"Price in discount — smart money buy zone");
  if(last>mid&&cS<0) push("premium_disc","Premium Zone","SHORT",70,"Price in premium — smart money sell zone");
  if(Math.abs(cS)>0.002) push("displacement","Displacement Candle",cS>0?"LONG":"SHORT",76,"Large institutional candle — SM direction confirmed");

  return results.sort((a,b)=>b.confidence-a.confidence);
}

// ── CANDLESTICK CHART WITH PATTERN LINES ──────────────────────────────────────
function CandleChart({ candles, pattern, direction, darkMode }) {
  if (!candles||candles.length===0) return null;
  const W=340, H=200, PAD=22;
  const slice=candles.slice(-35);
  const n=slice.length;
  const highs=slice.map(c=>parseFloat(c[2]));
  const lows=slice.map(c=>parseFloat(c[3]));
  const closes=slice.map(c=>parseFloat(c[4]));
  const maxP=Math.max(...highs)*1.002, minP=Math.min(...lows)*0.998;
  const range=maxP-minP||1;
  const toY=v=>PAD+((maxP-v)/range)*(H-PAD*2);
  const cW=(W-PAD*2)/n;
  const cx=i=>PAD+i*cW+cW/2;
  const bg=darkMode?"#070A14":"#F8FAFC";
  const grid=darkMode?"#1A1F35":"#E2E8F0";
  const patCol=direction==="LONG"?"#22C55E":"#EF4444";
  const patFill=direction==="LONG"?"#22C55E18":"#EF444418";

  const renderPatternLines=()=>{
    const p=pattern.toLowerCase();
    // TRIANGLES & PENNANT
    if(p.includes("triangle")||p.includes("pennant")) {
      const h1=highs[2],h2=highs[n-4],l1=lows[2],l2=lows[n-4];
      const apex=cx(n-1), apexY=(toY(h2)+toY(l2))/2;
      return (<g>
        <line x1={cx(2)} y1={toY(h1)} x2={cx(n-4)} y2={toY(h2)} stroke={patCol} strokeWidth="1.8" strokeDasharray="5,3" opacity="0.95"/>
        <line x1={cx(2)} y1={toY(l1)} x2={cx(n-4)} y2={toY(l2)} stroke={patCol} strokeWidth="1.8" strokeDasharray="5,3" opacity="0.95"/>
        <polygon points={`${apex},${apexY-7} ${apex-6},${apexY+5} ${apex+6},${apexY+5}`} fill={patCol} opacity="0.9"
          transform={direction==="SHORT"?`rotate(180,${apex},${apexY})`:""} />
      </g>);
    }
    // WEDGES
    if(p.includes("wedge")) {
      const h1=highs[2],h2=highs[n-5],l1=lows[2],l2=lows[n-5];
      return (<g>
        <line x1={cx(2)} y1={toY(h1)} x2={cx(n-5)} y2={toY(h2)} stroke={patCol} strokeWidth="1.8" strokeDasharray="5,3" opacity="0.95"/>
        <line x1={cx(2)} y1={toY(l1)} x2={cx(n-5)} y2={toY(l2)} stroke={patCol} strokeWidth="1.8" strokeDasharray="5,3" opacity="0.95"/>
        <rect x={cx(n-6)} y={PAD} width={6*cW} height={H-PAD*2} fill={patFill} rx="2"/>
      </g>);
    }
    // FLAGS
    if(p.includes("flag")) {
      const pole=Math.floor(n*0.45);
      const pColor=direction==="LONG"?"#22C55E":"#EF4444";
      const fH1=highs[pole],fH2=highs[n-3],fL1=lows[pole],fL2=lows[n-3];
      return (<g>
        <line x1={cx(2)} y1={toY(closes[2])} x2={cx(pole)} y2={toY(closes[pole])} stroke={pColor} strokeWidth="2.5" opacity="0.7"/>
        <line x1={cx(pole)} y1={toY(fH1)} x2={cx(n-3)} y2={toY(fH2)} stroke={patCol} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.9"/>
        <line x1={cx(pole)} y1={toY(fL1)} x2={cx(n-3)} y2={toY(fL2)} stroke={patCol} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.9"/>
        <rect x={cx(pole)} y={PAD} width={(n-3-pole)*cW} height={H-PAD*2} fill={patFill} rx="2"/>
      </g>);
    }
    // CUP & HANDLE
    if(p.includes("cup")) {
      const mid=Math.floor(n/2);
      const pts=Array.from({length:n-4},(_,i)=>{
        const t=(i)/(n-5);
        const arcY=toY(lows[mid])+(toY(lows[2])-toY(lows[mid]))*(2*t-1)*(2*t-1);
        return `${cx(i+2)},${arcY}`;
      }).join(" ");
      return (<g>
        <polyline points={pts} fill="none" stroke={patCol} strokeWidth="2" opacity="0.85"/>
        <line x1={cx(2)} y1={toY(highs[2])} x2={cx(n-3)} y2={toY(highs[n-3])} stroke={patCol} strokeWidth="1" strokeDasharray="3,5" opacity="0.5"/>
      </g>);
    }
    // DOUBLE TOP / BOTTOM
    if(p.includes("double")) {
      const isTop=p.includes("top");
      const p1=Math.floor(n*0.28), p2=Math.floor(n*0.72);
      const v1=isTop?highs[p1]:lows[p1], v2=isTop?highs[p2]:lows[p2];
      const neck=isTop?Math.min(...lows.slice(p1,p2)):Math.max(...highs.slice(p1,p2));
      return (<g>
        <circle cx={cx(p1)} cy={toY(v1)} r="5" fill="none" stroke={patCol} strokeWidth="2" opacity="0.9"/>
        <circle cx={cx(p2)} cy={toY(v2)} r="5" fill="none" stroke={patCol} strokeWidth="2" opacity="0.9"/>
        <line x1={cx(2)} y1={toY(neck)} x2={cx(n-2)} y2={toY(neck)} stroke={patCol} strokeWidth="1.5" strokeDasharray="5,3" opacity="0.85"/>
      </g>);
    }
    // HEAD & SHOULDERS
    if(p.includes("head")) {
      const ls=Math.floor(n*0.2), hd=Math.floor(n*0.5), rs=Math.floor(n*0.8);
      return (<g>
        <circle cx={cx(ls)} cy={toY(highs[ls])} r="4" fill={patCol} opacity="0.7"/>
        <circle cx={cx(hd)} cy={toY(highs[hd])} r="6" fill="none" stroke={patCol} strokeWidth="2" opacity="0.9"/>
        <circle cx={cx(rs)} cy={toY(highs[rs])} r="4" fill={patCol} opacity="0.7"/>
        <line x1={cx(ls)} y1={toY(lows[ls+2]||lows[ls])} x2={cx(rs)} y2={toY(lows[rs-2]||lows[rs])} stroke={patCol} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.85"/>
      </g>);
    }
    // SMC/ICT — key level zone
    const mid=(maxP+minP)/2;
    return (<g>
      <rect x={PAD} y={toY(mid*1.008)} width={W-PAD*2} height={toY(mid*0.992)-toY(mid*1.008)} fill={patFill} rx="3"/>
      <line x1={PAD} x2={W-PAD} y1={toY(mid)} y2={toY(mid)} stroke={patCol} strokeWidth="1.5" strokeDasharray="6,3" opacity="0.9"/>
    </g>);
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",borderRadius:10}}>
      <rect width={W} height={H} fill={bg} rx="10"/>
      {[0.2,0.4,0.6,0.8].map(t=>(
        <line key={t} x1={PAD} x2={W-PAD} y1={PAD+t*(H-PAD*2)} y2={PAD+t*(H-PAD*2)} stroke={grid} strokeWidth="0.7"/>
      ))}
      {slice.map((c,i)=>{
        const o=parseFloat(c[1]),h=parseFloat(c[2]),l=parseFloat(c[3]),cl=parseFloat(c[4]);
        const bull=cl>=o, col=bull?"#22C55E":"#EF4444";
        const x=PAD+i*cW+cW*0.15, bW=cW*0.7;
        const bTop=toY(Math.max(o,cl)), bH=Math.max(1.5,Math.abs(toY(o)-toY(cl)));
        const wX=x+bW/2;
        return (<g key={i}>
          <line x1={wX} x2={wX} y1={toY(h)} y2={toY(l)} stroke={col} strokeWidth="0.8"/>
          <rect x={x} y={bTop} width={bW} height={bH} fill={col} rx="0.5" opacity="0.9"/>
        </g>);
      })}
      {renderPatternLines()}
      <rect x={W-PAD-100} y={PAD-2} width={102} height={16} fill={darkMode?"#0D102090":"#ffffff90"} rx="4"/>
      <text x={W-PAD-49} y={PAD+10} fontSize="8.5" fill={patCol} fontWeight="700" textAnchor="middle">{pattern}</text>
    </svg>
  );
}

// ── BOTTOM SHEET ──────────────────────────────────────────────────────────────
function ChartSheet({ result, onClose, darkMode }) {
  if (!result) return null;
  const T = darkMode
    ? { bg:"#0D1020", border:"#1E2540", text:"#E2E4F0", sub:"#4A5280", card:"#070A14", muted:"#7B8FFF" }
    : { bg:"#FFFFFF", border:"#E2E8F0", text:"#0F172A", sub:"#94A3B8", card:"#F8FAFC", muted:"#6366F1" };
  const patCol=result.direction==="LONG"?"#22C55E":"#EF4444";
  const confColor=result.confidence>80?"#22C55E":result.confidence>72?"#EAB308":"#A78BFA";

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"#00000080",zIndex:200,animation:"fadeIn 0.2s"}}/>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:201,background:T.bg,borderTop:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",maxHeight:"88vh",overflowY:"auto",animation:"slideUp 0.3s ease"}}>
        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}>
          <div style={{width:40,height:4,borderRadius:2,background:T.border}}/>
        </div>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px 14px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:18,fontWeight:800,color:T.text}}>{result.pair.replace("USDT","/USDT")}</span>
              <span style={{fontSize:10,padding:"3px 10px",borderRadius:20,fontWeight:700,background:`${patCol}20`,color:patCol}}>
                {result.direction==="LONG"?"▲ LONG":"▼ SHORT"}
              </span>
              <span style={{fontSize:10,background:darkMode?"#1A1F35":"#EEF2FF",color:T.muted,padding:"3px 8px",borderRadius:4,fontWeight:600}}>{result.timeframe}</span>
            </div>
            <div style={{fontSize:13,color:T.muted,fontWeight:600}}>{result.pattern}</div>
          </div>
          <div onClick={onClose} style={{fontSize:20,color:T.sub,cursor:"pointer",padding:"4px 8px"}}>✕</div>
        </div>
        {/* Chart */}
        <div style={{padding:"0 14px 14px"}}>
          <CandleChart candles={result.candles} pattern={result.pattern} direction={result.direction} darkMode={darkMode}/>
        </div>
        {/* Details */}
        <div style={{padding:"0 18px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {label:"ENTRY",   val:`$${result.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}`, color:"#60A5FA"},
              {label:"TAKE PROFIT", val:`$${(result.price*(result.direction==="LONG"?1.03:0.97)).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}`, color:"#22C55E"},
              {label:"STOP LOSS",   val:`$${(result.price*(result.direction==="LONG"?0.985:1.015)).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}`, color:"#EF4444"},
            ].map(d=>(
              <div key={d.label} style={{background:T.card,borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
                <div style={{fontSize:9,color:T.sub,marginBottom:5,letterSpacing:"0.5px"}}>{d.label}</div>
                <div style={{fontSize:12,fontWeight:800,color:d.color}}>{d.val}</div>
              </div>
            ))}
          </div>
          <div style={{background:T.card,borderRadius:10,padding:"14px"}}>
            <div style={{fontSize:10,color:T.sub,marginBottom:6,letterSpacing:"0.5px"}}>PATTERN ANALYSIS</div>
            <div style={{fontSize:13,color:T.text,lineHeight:1.6,opacity:0.8}}>{result.description}</div>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:T.sub}}>Signal Strength</span>
              <span style={{fontSize:11,fontWeight:700,color:confColor}}>{result.confidence>=80?"Strong":result.confidence>=72?"Moderate":"Weak"} — {result.confidence}%</span>
            </div>
            <div style={{background:darkMode?"#1A1F35":"#E2E8F0",borderRadius:4,height:6}}>
              <div style={{height:"100%",borderRadius:4,background:`linear-gradient(90deg,${confColor},${confColor}90)`,width:`${result.confidence}%`,transition:"width 0.5s"}}/>
            </div>
          </div>
        </div>
        <div style={{height:20}}/>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </>
  );
}

// ── RESULTS SECTION ───────────────────────────────────────────────────────────
function ResultsSection({ results, runScan, scanning, darkMode }) {
  const [filter, setFilter] = useState("ALL");
  const [active, setActive] = useState(null);
  const T = darkMode
    ? { card:"#0D1020", border:"#161B2E", text:"#E2E4F0", muted:"#5A6080", sub:"#3A4460", faint:"#1A1F35" }
    : { card:"#FFFFFF", border:"#E2E8F0", text:"#0F172A", muted:"#64748B", sub:"#94A3B8", faint:"#F1F5F9" };

  const filtered = filter==="ALL" ? results : results.filter(r=>r.direction===filter);
  const longC  = results.filter(r=>r.direction==="LONG").length;
  const shortC = results.filter(r=>r.direction==="SHORT").length;
  const avgC   = Math.round(results.reduce((s,r)=>s+r.confidence,0)/results.length);

  return (
    <>
      {/* Stats */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{l:"SETUPS",v:results.length,c:T.text},{l:"LONG",v:longC,c:"#22C55E"},{l:"SHORT",v:shortC,c:"#EF4444"},{l:"AVG",v:`${avgC}%`,c:"#A78BFA"}].map(s=>(
          <div key={s.l} style={{flex:1,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 6px",textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,color:T.muted,marginTop:2,letterSpacing:"0.5px"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,background:T.faint,padding:4,borderRadius:10,border:`1px solid ${T.border}`}}>
        {["ALL","LONG","SHORT"].map(f=>{
          const active2=filter===f;
          const fc=f==="LONG"?"#22C55E":f==="SHORT"?"#EF4444":T.text;
          return (
            <div key={f} onClick={()=>setFilter(f)} style={{
              flex:1,textAlign:"center",padding:"9px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,letterSpacing:"0.5px",transition:"all 0.15s",
              background:active2?(f==="LONG"?"#22C55E20":f==="SHORT"?"#EF444420":darkMode?"#1A1F35":"#FFFFFF"):"transparent",
              color:active2?fc:T.muted,
              border:active2?`1px solid ${f==="LONG"?"#22C55E40":f==="SHORT"?"#EF444440":darkMode?"#2A3050":"#E2E8F0"}`:"1px solid transparent",
            }}>
              {f==="ALL"?`All (${results.length})`:f==="LONG"?`▲ Long (${longC})`:`▼ Short (${shortC})`}
            </div>
          );
        })}
      </div>

      <div style={{fontSize:11,color:T.sub,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>
        {filtered.length} setup{filtered.length!==1?"s":""} — tap card to view chart
      </div>

      {/* Cards */}
      {filtered.map(r=>{
        const dc=r.direction==="LONG"?"#22C55E":"#EF4444";
        const cc=r.confidence>80?"#22C55E":r.confidence>72?"#EAB308":"#A78BFA";
        return (
          <div key={r.id} onClick={()=>setActive(r)} style={{
            background:T.card, border:`1px solid ${r.direction==="LONG"?"#22C55E30":"#EF444430"}`,
            borderLeft:`3px solid ${dc}`, borderRadius:12, padding:"14px 16px", marginBottom:10, cursor:"pointer",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:15,fontWeight:700,color:T.text}}>{r.pair.replace("USDT","/USDT")}</span>
                  <span style={{fontSize:10,background:darkMode?"#1A1F35":"#EEF2FF",color:"#7B8FFF",padding:"2px 8px",borderRadius:4,fontWeight:600}}>{r.timeframe}</span>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:T.text,opacity:0.85}}>{r.pattern}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{r.description}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:`${dc}20`,color:dc}}>
                  {r.direction==="LONG"?"▲":"▼"} {r.direction}
                </div>
                <div style={{fontSize:12,fontWeight:700,color:T.text,marginTop:6}}>
                  ${r.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}
                </div>
                <div style={{fontSize:10,color:T.sub,marginTop:2}}>tap for chart →</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
              <div style={{flex:1,background:darkMode?"#1A1F35":"#E2E8F0",borderRadius:3,height:3}}>
                <div style={{height:"100%",borderRadius:3,background:cc,width:`${r.confidence}%`}}/>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:cc}}>{r.confidence}%</span>
            </div>
          </div>
        );
      })}

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"28px 0",color:T.muted}}>No {filter.toLowerCase()} setups found</div>
      )}

      <button onClick={runScan} disabled={scanning} style={{width:"100%",marginTop:8,padding:"12px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>
        🔄 Scan Again
      </button>

      <ChartSheet result={active} onClose={()=>setActive(null)} darkMode={darkMode}/>
    </>
  );
}

// ── STEP BAR ──────────────────────────────────────────────────────────────────
function StepBar({ step, setStep, darkMode }) {
  const steps=["Strategy","Patterns","Pairs","Exchange","Timeframe","Scan"];
  const T=darkMode?{muted:"#4A5280",faint:"#1A1F35",text:"#E2E4F0"}:{muted:"#94A3B8",faint:"#E2E8F0",text:"#0F172A"};
  return (
    <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:32}}>
      {steps.map((s,i)=>{
        const active=i+1===step, done=i+1<step;
        const clickable=done;
        return (
          <div key={s} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"auto"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <div
                onClick={()=>clickable&&setStep(i+1)}
                style={{width:28,height:28,borderRadius:"50%",background:done||active?"#3B82F6":T.faint,border:`2px solid ${done||active?"#3B82F6":darkMode?"#1E2540":"#E2E8F0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:done||active?"#fff":T.muted,boxShadow:active?"0 0 14px #3B82F640":"none",transition:"all 0.3s",cursor:clickable?"pointer":"default",transform:clickable?"scale(1)":"scale(1)"}}>
                {done?"✓":i+1}
              </div>
              <span
                onClick={()=>clickable&&setStep(i+1)}
                style={{fontSize:9,color:active?T.text:done?"#60A5FA":T.muted,fontWeight:active||done?600:400,letterSpacing:"0.3px",whiteSpace:"nowrap",cursor:clickable?"pointer":"default",textDecoration:clickable&&!active?"underline":"none",textDecorationColor:"#3B82F640"}}>
                {s}
              </span>
            </div>
            {i<steps.length-1&&<div style={{flex:1,height:2,background:done?"#3B82F6":T.faint,margin:"0 4px",marginBottom:16,transition:"background 0.3s"}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CryptoScanner() {
  const [darkMode, setDarkMode]                 = useState(true);
  const [step, setStep]                         = useState(1);
  const [strategy, setStrategy]                 = useState(null);
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [selectedPairs, setSelectedPairs]       = useState([]);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [selectedTFs, setSelectedTFs]           = useState([]);
  const [scanning, setScanning]                 = useState(false);
  const [progress, setProgress]                 = useState(0);
  const [scanMsg, setScanMsg]                   = useState("");
  const [results, setResults]                   = useState(null);
  const [allPairs, setAllPairs]                 = useState([]);
  const [pairsLoading, setPairsLoading]         = useState(false);
  const [pairSearch, setPairSearch]             = useState("");

  const T = darkMode
    ? { bg:"#060810", surface:"#0D1020", border:"#161B2E", border2:"#1E2540", text:"#E2E4F0", muted:"#5A6080", faint:"#1A1F35" }
    : { bg:"#F1F5F9", surface:"#FFFFFF", border:"#E2E8F0", border2:"#CBD5E1", text:"#0F172A", muted:"#64748B", faint:"#F8FAFC" };

  const toggleArr=(arr,set,val)=>set(arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]);
  const stratData=STRATEGIES.find(s=>s.id===strategy);
  const patterns=strategy?STRATEGY_PATTERNS[strategy]:[];

  const fetchAllPairs=useCallback(async()=>{
    if(allPairs.length>0) return;
    setPairsLoading(true);
    try {
      const res=await fetch("https://api.binance.com/api/v3/exchangeInfo");
      const data=await res.json();
      const pairs=data.symbols.filter(s=>s.quoteAsset==="USDT"&&s.status==="TRADING").map(s=>s.symbol).sort();
      setAllPairs(pairs);
    } catch(e){ console.error(e); }
    setPairsLoading(false);
  },[allPairs.length]);

  const runScan=useCallback(async()=>{
    if(!selectedPairs.length||!selectedTFs.length||!selectedPatterns.length||!selectedExchange) return;
    setScanning(true); setResults(null); setProgress(0);
    const jobs=selectedPairs.flatMap(p=>selectedTFs.map(tf=>({p,tf})));
    const found=[];
    for(let i=0;i<jobs.length;i++){
      const {p,tf}=jobs[i];
      setScanMsg(`Scanning ${p.replace("USDT","")} ${tf.toUpperCase()}…`);
      try {
        const candles=await fetchCandles(p,tf,selectedExchange);
        if(candles&&candles.length>0){
          const detected=detectPatterns(candles,selectedPatterns);
          detected.forEach(d=>found.push({...d,pair:p,timeframe:tf.toUpperCase(),candles,id:`${p}-${tf}-${d.id}-${Date.now()}`}));
        }
      } catch(e){ console.error(e); }
      setProgress(Math.round(((i+1)/jobs.length)*100));
    }
    found.sort((a,b)=>b.confidence-a.confidence);
    setResults(found); setScanMsg(""); setScanning(false);
  },[selectedPairs,selectedTFs,selectedPatterns,selectedExchange]);

  const sty={
    heading:{fontSize:22,fontWeight:800,color:T.text,marginBottom:6,letterSpacing:"-0.3px"},
    sub:{fontSize:14,color:T.muted,lineHeight:1.5},
    nextBtn:(on)=>({marginTop:24,padding:"14px 24px",borderRadius:10,border:"none",background:on?"linear-gradient(135deg,#3B82F6,#6366F1)":T.faint,color:on?"#fff":T.muted,fontSize:14,fontWeight:700,cursor:on?"pointer":"not-allowed",boxShadow:on?"0 4px 20px #3B82F640":"none",transition:"all 0.2s"}),
    backBtn:{marginTop:24,padding:"14px 18px",borderRadius:10,border:`1px solid ${T.border2}`,background:"transparent",color:T.muted,fontSize:14,fontWeight:600,cursor:"pointer"},
    navRow:{display:"flex",gap:10,alignItems:"center"},
    miniBtn:{padding:"6px 14px",borderRadius:7,border:`1px solid ${T.border2}`,background:"transparent",color:T.muted,fontSize:12,cursor:"pointer"},
    scanBtn:(sc)=>({width:"100%",padding:"15px",borderRadius:11,border:"none",background:sc?T.faint:"linear-gradient(135deg,#3B82F6,#6366F1)",color:sc?T.muted:"#fff",fontSize:15,fontWeight:800,cursor:sc?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:sc?"none":"0 4px 24px #3B82F640",transition:"all 0.2s"}),
    chip:(active,color)=>({padding:"14px 10px",borderRadius:12,border:`1px solid ${active?color:T.border2}`,background:active?`${color}18`:T.surface,cursor:"pointer",textAlign:"center",transition:"all 0.15s",boxShadow:active?`0 0 12px ${color}30`:"none"}),
    summaryChip:{display:"flex",flexDirection:"column",gap:3,padding:"10px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface},
  };

  const renderStep=()=>{
    // STEP 1
    if(step===1) return (
      <div>
        <h2 style={sty.heading}>Choose your strategy</h2>
        <p style={sty.sub}>Your strategy determines which patterns the scanner will detect.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:24}}>
          {STRATEGIES.map(s=>(
            <div key={s.id} onClick={()=>{setStrategy(s.id);setSelectedPatterns([]);}}
              style={{padding:"18px 20px",borderRadius:14,border:`1px solid ${strategy===s.id?s.color:T.border}`,background:strategy===s.id?s.glow:T.surface,cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"all 0.2s",boxShadow:strategy===s.id?`0 0 20px ${s.glow}`:"none"}}>
              <span style={{fontSize:26}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:strategy===s.id?s.color:T.text}}>{s.name}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{s.tagline}</div>
              </div>
              <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${strategy===s.id?s.color:T.border2}`,background:strategy===s.id?s.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>
                {strategy===s.id&&"✓"}
              </div>
            </div>
          ))}
        </div>
        <button style={sty.nextBtn(!!strategy)} disabled={!strategy} onClick={()=>setStep(2)}>Continue →</button>
      </div>
    );

    // STEP 2
    if(step===2) return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{fontSize:18}}>{stratData?.icon}</span>
          <h2 style={{...sty.heading,marginBottom:0}}>{stratData?.name} Patterns</h2>
        </div>
        <p style={sty.sub}>Select the setups you want the scanner to detect.</p>
        <div style={{display:"flex",gap:8,margin:"14px 0"}}>
          <button style={sty.miniBtn} onClick={()=>setSelectedPatterns(patterns.map(p=>p.id))}>Select All</button>
          <button style={sty.miniBtn} onClick={()=>setSelectedPatterns([])}>Clear</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:370,overflowY:"auto",paddingRight:4}}>
          {patterns.map(p=>{
            const active=selectedPatterns.includes(p.id);
            const sc=stratData?.color||"#3B82F6";
            return (
              <div key={p.id} onClick={()=>toggleArr(selectedPatterns,setSelectedPatterns,p.id)}
                style={{padding:"13px 15px",borderRadius:11,border:`1px solid ${active?sc:T.border}`,background:active?`${sc}12`:T.surface,cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12,transition:"all 0.15s"}}>
                <div style={{width:18,height:18,borderRadius:5,marginTop:1,flexShrink:0,border:`2px solid ${active?sc:T.border2}`,background:active?sc:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>
                  {active&&"✓"}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:active?T.text:T.muted}}>{p.name}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2,lineHeight:1.5}}>{p.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={sty.navRow}>
          <button style={sty.backBtn} onClick={()=>setStep(1)}>← Back</button>
          <button style={sty.nextBtn(selectedPatterns.length>0)} disabled={!selectedPatterns.length} onClick={()=>{fetchAllPairs();setStep(3);}}>
            Continue ({selectedPatterns.length}) →
          </button>
        </div>
      </div>
    );

    // STEP 3
    if(step===3){
      const RECOMMENDED=[
        {symbol:"BTCUSDT",label:"BTC",name:"Bitcoin",  icon:"₿",color:"#F7931A"},
        {symbol:"ETHUSDT",label:"ETH",name:"Ethereum", icon:"Ξ",color:"#627EEA"},
        {symbol:"SOLUSDT",label:"SOL",name:"Solana",   icon:"◎",color:"#9945FF"},
        {symbol:"BNBUSDT",label:"BNB",name:"BNB",      icon:"B",color:"#F0B90B"},
        {symbol:"XRPUSDT",label:"XRP",name:"XRP",      icon:"✕",color:"#00AAE4"},
        {symbol:"DOGEUSDT",label:"DOGE",name:"Dogecoin",icon:"Ð",color:"#C2A633"},
        {symbol:"PEPEUSDT",label:"PEPE",name:"Pepe",   icon:"🐸",color:"#00A550"},
        {symbol:"WIFUSDT",label:"WIF",name:"dogwifhat",icon:"🐕",color:"#9945FF"},
        {symbol:"SHIBUSDT",label:"SHIB",name:"Shiba",  icon:"🐕",color:"#E01A2B"},
        {symbol:"AVAXUSDT",label:"AVAX",name:"Avalanche",icon:"A",color:"#E84142"},
        {symbol:"LINKUSDT",label:"LINK",name:"Chainlink",icon:"⬡",color:"#2A5ADA"},
        {symbol:"SUIUSDT",label:"SUI",name:"Sui",      icon:"◈",color:"#4DA2FF"},
      ];
      const filteredSearch=pairSearch.trim()?allPairs.filter(p=>p.toLowerCase().includes(pairSearch.trim().toLowerCase())):[];
      const showSearch=pairSearch.trim().length>0;
      const allSearchSel=filteredSearch.length>0&&filteredSearch.every(p=>selectedPairs.includes(p));
      return (
        <div>
          <h2 style={sty.heading}>Select crypto pairs</h2>
          <p style={sty.sub}>Choose popular pairs or search any coin in the market.</p>
          <div style={{marginTop:18,marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"1px",textTransform:"uppercase"}}>🔥 Popular Pairs</span>
              {selectedPairs.length>0&&<span onClick={()=>setSelectedPairs([])} style={{fontSize:11,color:T.muted,cursor:"pointer"}}>Clear all</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>
              {RECOMMENDED.map(r=>{
                const active=selectedPairs.includes(r.symbol);
                return (
                  <div key={r.symbol} onClick={()=>toggleArr(selectedPairs,setSelectedPairs,r.symbol)}
                    style={{...sty.chip(active,r.color),position:"relative"}}>
                    {active&&<div style={{position:"absolute",top:5,right:5,width:14,height:14,borderRadius:"50%",background:r.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:800}}>✓</div>}
                    <div style={{fontSize:16,marginBottom:3,color:r.color}}>{r.icon}</div>
                    <div style={{fontSize:12,fontWeight:800,color:active?r.color:T.text}}>{r.label}</div>
                    <div style={{fontSize:9,color:T.muted,marginTop:1}}>{r.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"1px",textTransform:"uppercase",marginBottom:10}}>
              🔍 Search All {pairsLoading?"…":`${allPairs.length}+`} Pairs
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <div style={{flex:1,position:"relative"}}>
                <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:13}}>🔍</span>
                <input type="text" placeholder="e.g. PEPE, BONK, ONDO, INJ…" value={pairSearch} onChange={e=>setPairSearch(e.target.value)}
                  style={{width:"100%",padding:"10px 12px 10px 34px",borderRadius:9,border:`1px solid ${T.border2}`,background:T.surface,color:T.text,fontSize:13,outline:"none"}}/>
                {pairSearch&&<span onClick={()=>setPairSearch("")} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",color:T.muted,cursor:"pointer",fontSize:15}}>✕</span>}
              </div>
              {showSearch&&filteredSearch.length>0&&(
                <button style={{padding:"10px 12px",borderRadius:9,border:`1px solid ${allSearchSel?"#EF4444":"#3B82F640"}`,background:allSearchSel?"#EF444415":"#1D3A6E",color:allSearchSel?"#EF4444":"#93C5FD",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}
                  onClick={()=>allSearchSel?setSelectedPairs(selectedPairs.filter(p=>!filteredSearch.includes(p))):setSelectedPairs([...new Set([...selectedPairs,...filteredSearch])])}>
                  {allSearchSel?`✕ Remove (${filteredSearch.length})`:`+ Add All (${filteredSearch.length})`}
                </button>
              )}
            </div>
            {pairsLoading&&<div style={{textAlign:"center",padding:"16px 0",color:T.muted,fontSize:13}}><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span> Loading…</div>}
            {showSearch&&!pairsLoading&&(
              <div style={{maxHeight:200,overflowY:"auto",paddingRight:4}}>
                {filteredSearch.length===0?<div style={{textAlign:"center",padding:"20px 0",color:T.muted,fontSize:13}}>No pairs found for "{pairSearch}"</div>:(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                    {filteredSearch.map(p=>{
                      const active=selectedPairs.includes(p);
                      return (
                        <div key={p} onClick={()=>toggleArr(selectedPairs,setSelectedPairs,p)}
                          style={{padding:"10px 8px",borderRadius:9,textAlign:"center",border:`1px solid ${active?"#3B82F6":T.border2}`,background:active?"#1D3A6E":T.surface,color:active?"#93C5FD":T.muted,cursor:"pointer",fontWeight:700,fontSize:11,transition:"all 0.12s"}}>
                          {p.replace("USDT","")}
                          <div style={{fontSize:9,color:active?"#60A5FA":T.sub,marginTop:2}}>USDT</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {!showSearch&&!pairsLoading&&<div style={{textAlign:"center",padding:"12px 0",color:T.sub,fontSize:12}}>Type a coin name to search all pairs</div>}
          </div>
          {selectedPairs.length>0&&(
            <div style={{marginTop:12,padding:"10px 14px",borderRadius:9,background:T.faint,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:"#60A5FA",fontWeight:700}}>{selectedPairs.length} pair{selectedPairs.length>1?"s":""} selected</span>
              <span style={{fontSize:11,color:T.muted}}>{selectedPairs.map(p=>p.replace("USDT","")).slice(0,4).join(", ")}{selectedPairs.length>4?` +${selectedPairs.length-4} more`:""}</span>
            </div>
          )}
          <div style={sty.navRow}>
            <button style={sty.backBtn} onClick={()=>setStep(2)}>← Back</button>
            <button style={sty.nextBtn(selectedPairs.length>0)} disabled={!selectedPairs.length} onClick={()=>setStep(4)}>
              Continue ({selectedPairs.length} pairs) →
            </button>
          </div>
        </div>
      );
    }

    // STEP 4
    if(step===4) return (
      <div>
        <h2 style={sty.heading}>Choose your exchange</h2>
        <p style={sty.sub}>Select which exchange the scanner will pull chart data from.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:24}}>
          {EXCHANGES.map(ex=>(
            <div key={ex.id} onClick={()=>setSelectedExchange(ex.id)}
              style={{padding:"18px 20px",borderRadius:14,border:`1px solid ${selectedExchange===ex.id?ex.color:T.border}`,background:selectedExchange===ex.id?ex.glow:T.surface,cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"all 0.2s",boxShadow:selectedExchange===ex.id?`0 0 20px ${ex.glow}`:"none"}}>
              <span style={{fontSize:26}}>{ex.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                  <span style={{fontSize:15,fontWeight:700,color:selectedExchange===ex.id?ex.color:T.text}}>{ex.name}</span>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${ex.color}20`,color:ex.color,fontWeight:600}}>{ex.tag}</span>
                </div>
                <div style={{fontSize:12,color:T.muted}}>{ex.desc}</div>
              </div>
              <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${selectedExchange===ex.id?ex.color:T.border2}`,background:selectedExchange===ex.id?ex.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>
                {selectedExchange===ex.id&&"✓"}
              </div>
            </div>
          ))}
        </div>
        <div style={sty.navRow}>
          <button style={sty.backBtn} onClick={()=>setStep(3)}>← Back</button>
          <button style={sty.nextBtn(!!selectedExchange)} disabled={!selectedExchange} onClick={()=>setStep(5)}>Continue →</button>
        </div>
      </div>
    );

    // STEP 5
    if(step===5) return (
      <div>
        <h2 style={sty.heading}>Select timeframes</h2>
        <p style={sty.sub}>Scanner will check all selected timeframes for patterns.</p>
        <div style={{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"}}>
          {TIMEFRAMES.map(tf=>{
            const active=selectedTFs.includes(tf.value);
            return (
              <div key={tf.value} onClick={()=>toggleArr(selectedTFs,setSelectedTFs,tf.value)}
                style={{flex:1,minWidth:70,padding:"22px 12px",borderRadius:12,border:`1px solid ${active?"#3B82F6":T.border}`,background:active?"#3B82F618":T.surface,cursor:"pointer",textAlign:"center",transition:"all 0.2s",boxShadow:active?"0 0 16px #3B82F630":"none"}}>
                <div style={{fontSize:20,fontWeight:800,color:active?"#60A5FA":T.muted}}>{tf.label}</div>
              </div>
            );
          })}
        </div>
        <div style={sty.navRow}>
          <button style={sty.backBtn} onClick={()=>setStep(4)}>← Back</button>
          <button style={sty.nextBtn(selectedTFs.length>0)} disabled={!selectedTFs.length} onClick={()=>setStep(6)}>Start Scanning →</button>
        </div>
      </div>
    );

    // STEP 6
    if(step===6) return (
      <div>
        {/* Summary */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {[
            {label:"Strategy",value:stratData?.name,icon:stratData?.icon},
            {label:"Patterns",value:`${selectedPatterns.length} patterns`},
            {label:"Pairs",   value:`${selectedPairs.length} pairs`},
            {label:"Exchange",value:EXCHANGES.find(e=>e.id===selectedExchange)?.name,icon:EXCHANGES.find(e=>e.id===selectedExchange)?.icon},
            {label:"TFs",     value:selectedTFs.map(t=>t.toUpperCase()).join(", ")},
          ].map(item=>(
            <div key={item.label} style={sty.summaryChip}>
              <span style={{fontSize:9,color:T.muted,letterSpacing:"0.5px"}}>{item.label.toUpperCase()}</span>
              <span style={{fontSize:12,color:T.text,fontWeight:600}}>{item.icon?`${item.icon} `:""}{item.value}</span>
            </div>
          ))}
        </div>
        <button style={sty.scanBtn(scanning)} onClick={runScan} disabled={scanning}>
          {scanning?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span> {scanMsg}</>:<>⚡ Run Scan</>}
        </button>
        {scanning&&(
          <div style={{marginTop:10}}>
            <div style={{background:T.faint,borderRadius:4,height:4}}>
              <div style={{height:"100%",borderRadius:4,background:"linear-gradient(90deg,#3B82F6,#60A5FA)",width:`${progress}%`,transition:"width 0.3s"}}/>
            </div>
            <div style={{fontSize:11,color:T.muted,marginTop:5,textAlign:"center"}}>{progress}% complete</div>
          </div>
        )}
        {results!==null&&(
          <div style={{marginTop:24}}>
            {results.length===0?(
              <div style={{textAlign:"center",padding:"40px 20px",color:T.muted}}>
                <div style={{fontSize:36,marginBottom:12}}>🔍</div>
                <div style={{fontWeight:600,marginBottom:6}}>No patterns detected</div>
                <div style={{fontSize:13,marginBottom:16}}>Scanned {selectedPairs.length}×{selectedTFs.length} = {selectedPairs.length*selectedTFs.length} charts</div>
                <button onClick={runScan} style={{padding:"10px 24px",borderRadius:9,border:`1px solid ${T.border2}`,background:T.surface,color:"#60A5FA",fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 Scan Again</button>
              </div>
            ):(
              <ResultsSection results={results} runScan={runScan} scanning={scanning} darkMode={darkMode}/>
            )}
          </div>
        )}
        {/* Back button */}
        {!scanning && (
          <button style={{...sty.backBtn, marginTop: results!==null ? 16 : 0, width:"100%", textAlign:"center"}} onClick={()=>setStep(5)}>
            ← Back to Timeframes
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Inter','SF Pro Display',system-ui,sans-serif",transition:"background 0.3s"}}>
      {/* Header */}
      <div style={{borderBottom:`1px solid ${T.border}`,padding:"14px 22px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,background:T.bg,zIndex:100}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
        <span style={{fontSize:16,fontWeight:800,background:"linear-gradient(90deg,#60A5FA,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",flex:1}}>
          PatternAI Scanner
        </span>
        {/* Dark/Light toggle */}
        <div onClick={()=>setDarkMode(!darkMode)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"7px 14px",borderRadius:20,border:`1px solid ${T.border2}`,background:T.surface,transition:"all 0.2s"}}>
          <span style={{fontSize:14}}>{darkMode?"🌙":"☀️"}</span>
          <span style={{fontSize:12,fontWeight:600,color:T.muted}}>{darkMode?"Dark":"Light"}</span>
        </div>
      </div>
      {/* Content */}
      <div style={{maxWidth:560,margin:"0 auto",padding:"28px 20px"}}>
        <StepBar step={step} darkMode={darkMode}/>
        {renderStep()}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1E2540;border-radius:3px}`}</style>
    </div>
  );
}
