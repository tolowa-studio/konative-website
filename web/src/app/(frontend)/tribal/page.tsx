import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tribal & Grant-Funded Connectivity Procurement | Konative",
  description: "Vendor-neutral internet, transport, managed network, voice, cloud and security sourcing for Tribal governments, enterprises and funded broadband projects.",
};

const questions = [
  "Which providers can serve every funded or operating location?",
  "What bandwidth, transport, redundancy, security, and managed services are actually required?",
  "Do construction charges, route dependencies, contract terms, and delivery dates fit the award?",
  "How should carrier responses be normalized into a defensible comparison?",
  "Who will manage ordering, installation, escalation, billing, and renewal after selection?",
];

export default function TribalPage() {
  return <main style={{ background: "#fff", color: "#111827" }}>
    <section style={{ background: "#08142D", color: "#fff", padding: "150px 32px 92px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}><p style={eyebrow}>Tribal and funded connectivity</p><h1 style={title}>Turn program dollars into <span>working connectivity.</span></h1><p style={lede}>Konative helps Tribal governments, broadband authorities, enterprises, gaming, healthcare, education, and public-safety teams define requirements, test serviceability, compare suppliers, and move selected services through installation.</p><div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}><Link href="/contact?projectType=tribal_funded#request" style={button}>Bring us a funded project</Link><Link href="/tribal/awards" style={outline}>Explore TBCP awards</Link></div></div>
    </section>
    <section style={section}><p style={redEye}>What Tribal buyers need to know</p><h2 style={h2}>A grant award is not a network design.</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 1, background: "#E5E7EB", marginTop: 38 }}>{questions.map((q,i)=><div key={q} style={{ background: "#fff", padding: 28 }}><b style={{ color: "#C8001F" }}>0{i+1}</b><p style={{ fontSize: 17, lineHeight: 1.55, fontWeight: 650 }}>{q}</p></div>)}</div></section>
    <section style={{ ...section, background: "#F7F8FA", maxWidth: "none" }}><div style={{ maxWidth: 1180, margin: "0 auto" }}><p style={redEye}>What Konative delivers</p><h2 style={h2}>A faster path from requirement to installed service.</h2><div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:20,marginTop:38 }}>{[["Requirements brief","Locations, applications, bandwidth, resilience, security, schedule, and procurement context."],["Supplier comparison","Availability, recurring and one-time pricing, construction, terms, route assumptions, and risks."],["Selection support","A clear recommendation with tradeoffs rather than a stack of incompatible carrier quotes."],["Lifecycle advocacy","Order management, installation checkpoints, escalation, billing support, and renewal planning."]].map(([a,b])=><article key={a} style={{background:"#fff",borderTop:"3px solid #C8001F",padding:28}}><h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,textTransform:"uppercase"}}>{a}</h3><p style={{color:"#667085",lineHeight:1.7}}>{b}</p></article>)}</div></div></section>
    <section style={{ background:"#08142D",color:"#fff",padding:"80px 32px",textAlign:"center" }}><h2 style={{...h2,color:"#fff",margin:"0 auto"}}>Do not start with one carrier. Start with the requirement.</h2><p style={{color:"rgba(255,255,255,.65)",maxWidth:660,margin:"22px auto 30px",lineHeight:1.7}}>A direct quote gives you one supplier&apos;s answer. Konative structures the requirement, creates competition, and keeps one accountable advisor involved through delivery.</p><Link href="/contact?projectType=tribal_funded#request" style={button}>Start a Tribal connectivity review</Link></section>
  </main>;
}
const section={maxWidth:1180,margin:"0 auto",padding:"86px 32px"};
const eyebrow={color:"#FF526B",textTransform:"uppercase" as const,letterSpacing:".16em",fontWeight:800,fontSize:11};
const redEye={...eyebrow,color:"#C8001F"};
const title={fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(58px,9vw,106px)",lineHeight:.88,textTransform:"uppercase" as const,maxWidth:900,margin:"18px 0 24px"};
const lede={fontSize:18,lineHeight:1.7,color:"rgba(255,255,255,.68)",maxWidth:760};
const h2={fontFamily:"'Barlow Condensed',sans-serif",fontSize:"clamp(42px,6vw,70px)",lineHeight:.94,textTransform:"uppercase" as const,maxWidth:850,margin:"14px 0"};
const button={display:"inline-block",background:"#C8001F",color:"#fff",padding:"16px 24px",textDecoration:"none",textTransform:"uppercase" as const,fontWeight:800,fontSize:12,letterSpacing:".1em"};
const outline={...button,background:"transparent",border:"1px solid rgba(255,255,255,.35)"};
