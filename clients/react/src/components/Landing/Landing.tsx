import './Landing.scss'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePageSEO } from '../../hooks/usePageSEO'

const features = [
  { title: 'Dual-Mode POS', desc: 'Quick Sale for OTC, Proper Sale for Rx. Instant pricing, full compliance, optional SMS receipts.' },
  // { title: 'Dual Temperature Sensors', desc: 'Fridge (2–8°C) + ambient monitoring. Detects cooling failures and unsafe conditions.' },
  { title: 'Batch-Level FEFO', desc: 'First Expire, First Out enforced automatically. Expiry alerts, traceability, quarantine on violations.' },
  { title: 'Camera Integration', desc: 'Live fridge feed + event recording. Future-ready for on-device CV (vial counting, anomaly detection).' },
  { title: 'Prescription Linking', desc: 'Store once, reuse for refills. Quick Sale via phone number. Full Drugs & Cosmetics Act compliance.' },
  { title: 'Edge + Cloud Hybrid', desc: 'Raspberry Pi runs locally, zero internet downtime. Cloud syncs for backup, analytics, compliance.' },
]

const uniquePoints = [
  {
    letter: 'A',
    title: 'Integrated Hardware–Software Stack',
    subtitle: 'RARE IN MARKET',
    desc: 'Most solutions force you to choose between inventory software OR cold-chain monitoring. Pharmetrix unifies both in one ecosystem—unified dashboard, unified logic, one truth.'
  },
  {
    letter: 'B',
    title: 'Dual Sales Mode',
    subtitle: 'QUICK VS PROPER',
    desc: 'Quick Sale: Tablet-fast OTC checkout with auto-pricing. Proper Sale: Full bill, Rx support, customer details. Log everything for audit.'
  },
  {
    letter: 'C',
    title: 'Prescription-Linked Quick Sale',
    subtitle: 'LEGAL & SMART',
    desc: 'Customer uploads Rx once. Refills via Quick Sale by phone number. System validates validity. Complies with Drugs & Cosmetics Act while maintaining speed.'
  },
  {
    letter: 'D',
    title: 'Dual Temperature Sensors',
    subtitle: 'COMPLETE THERMAL VISIBILITY',
    desc: 'Sensor 1: Inside fridge (2–8°C). Sensor 2: Ambient. Detects failures, prevents heat exposure, WHO/CDC-compatible storage verification.'
  },
  {
    letter: 'E',
    title: 'Camera (Future-Ready)',
    subtitle: 'EVEN WITHOUT CV YET',
    desc: 'Remote visual verification today. On-device vial counting and anomaly detection tomorrow. No cloud inferencing needed.'
  },
  {
    letter: 'F',
    title: 'Edge + Cloud Hybrid',
    subtitle: 'NO FULL-TIME CLOUD DEPENDENCY',
    desc: 'Raspberry Pi processes everything locally. Works during internet outages. Cloud syncs periodically for backup and compliance reporting.'
  },
  {
    letter: 'G',
    title: 'Future-Ready Hardware',
    subtitle: 'ML-CAPABLE ARCHITECTURE',
    desc: 'Current: Pi 4. Future: Pi Zero + Coral TPU or Jetson Nano. Temperature anomaly prediction, early failure detection, on-device ML—no cloud inference.'
  },
  {
    letter: 'H',
    title: 'Extremely Low Cost',
    subtitle: '80–90% CHEAPER',
    desc: 'Pharmetrix: ₹10,000–20,000. Others: ₹80,000–1.5 lakh. Enterprise automation at startup pricing.'
  },
]

const metrics = [
  { value: 'Real-Time', label: 'Temperature Tracking' },
  { value: '24/7', label: 'Monitoring' },
  { value: '99.9%', label: 'Uptime' },
  { value: 'Automated', label: 'Expiry Management' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
}

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

export default function Landing() {
  usePageSEO({
    title: 'Pharmetrix - Smart Pharmacy Management & Inventory System',
    description: 'Unified IoT + cloud platform for pharmaceutical inventory management. Real-time temperature monitoring, dual-mode POS, FEFO batch management, camera integration & compliance automation. 80-90% cheaper than enterprise solutions.',
    keywords: 'pharmacy management, pharmaceutical inventory system, cold-chain monitoring, POS system, FEFO management, pharmacy software, IoT pharmacy solution, medication inventory',
    ogUrl: 'https://pharmetrix.onrender.com/',
    canonical: 'https://pharmetrix.onrender.com/',
  })

  return (
    <>
      {/* Header */}
      <header className="header" role="banner">
        <div className="container">
          <div className="nav">
            <a href="#" className="brand" aria-label="Pharmetrix">
              <img className="brandLogo" src="/full-logo.png" alt="Pharmetrix" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              {/* <span className="brandName">Pharmetrix</span> */}
            </a>
            <nav className="links" aria-label="Primary">
              <a href="#why">Why Pharmetrix</a>
              <a href="#features">Features</a>
              <a href="#compliance">Compliance</a>
              <Link className="button buttonSecondary" to="/auth">Login</Link>
              <Link className="button buttonPrimary" to="/get-started">Get Started</Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <motion.section className="section hero" aria-labelledby="hero-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="container heroGrid">
            <motion.div className="heroText" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <motion.h1 id="hero-title" className="h1 heroTitle" variants={fadeUp}>
                Pharmacy's Digital Twin
              </motion.h1>
              <motion.p className="lead" variants={fadeUp}>
                Pharmetrix is a unified IoT + cloud platform that brings real-time inventory management, cold-chain monitoring, and compliance automation to your pharmacy—at 80–90% lower cost than enterprise solutions.
              </motion.p>
              <motion.div className="heroHighlights" variants={stagger} initial="hidden" animate="show">
                <motion.div className="highlight" variants={fadeUp}>
                  <span className="highlightIcon">✓</span>
                  <span>Integrated Hardware + Software</span>
                </motion.div>
                <motion.div className="highlight" variants={fadeUp}>
                  <span className="highlightIcon">✓</span>
                  <span>Dual-Mode POS (Quick & Proper Sales)</span>
                </motion.div>
                <motion.div className="highlight" variants={fadeUp}>
                  <span className="highlightIcon">✓</span>
                  <span>Temperature + Camera Monitoring</span>
                </motion.div>
              </motion.div>
              <motion.div className="heroCtas" variants={fadeUp}>
                <Link className="button buttonPrimary" to="/get-started">Get Started</Link>
                <a className="button buttonSecondary" href="#why">Learn More</a>
              </motion.div>
            </motion.div>

            <motion.div className="heroVisual" aria-hidden="true" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }}>
              <div className="visualCard">
                <div className="visualHeader">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <div className="visualBody">
                  <div className="placeholderChart">
                    <div className="bar" style={{ height: '65%' }} />
                    <div className="bar" style={{ height: '88%' }} />
                    <div className="bar" style={{ height: '42%' }} />
                    <div className="bar" style={{ height: '72%' }} />
                  </div>
                  <div className="placeholderBadge">Dashboard Preview</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Pharmetrix Section */}
        <section id="why" className="section whyPharmetrix" aria-labelledby="why-title">
          <div className="container">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <motion.h2 id="why-title" className="h2 sectionTitle" variants={fadeUp}>Why Pharmetrix?</motion.h2>
              <motion.p className="subhead" variants={fadeUp}>The market forces you to choose between software OR hardware solutions. We unified both.</motion.p>
            </motion.div>

            <div className="whyGrid">
              <motion.div className="whyCard whyCardLeft" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <div className="whyCardBadge">Traditional POS</div>
                <h3 className="h3">Software-Only Solutions</h3>
                <ul className="whyList">
                  <li>✓ Manage sales & inventory</li>
                  <li>✗ No temperature monitoring</li>
                  <li>✗ No physical verification</li>
                  <li>✗ Fridges = Black box</li>
                </ul>
              </motion.div>

              <motion.div className="whyCardCenter" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeInScale}>
                <div className="centerBadge">Pharmetrix</div>
                <h3 className="h3 centerTitle">Complete Ecosystem</h3>
                <p className="centerText">
                  Stock + Sales + Storage + Compliance
                </p>
                <div className="centerIcon">🎯</div>
              </motion.div>

              <motion.div className="whyCard whyCardRight" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <div className="whyCardBadge">Cold-Chain IoT</div>
                <h3 className="h3">Hardware-Only Solutions</h3>
                <ul className="whyList">
                  <li>✓ Monitor temperature</li>
                  <li>✗ No sales integration</li>
                  <li>✗ No batch management</li>
                  <li>✗ Disconnected data</li>
                </ul>
              </motion.div>
            </div>

            <motion.div className="costComparison" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <h3 className="h3">Cost Advantage: 80–90% Cheaper</h3>
              <div className="costGrid">
                <div className="costItem">
                  <div className="costLabel">Pharmetrix</div>
                  <div className="costPrice">₹10K–20K</div>
                  <div className="costSmall">Hardware + Setup</div>
                </div>
                <div className="costItem costAlt">
                  <div className="costLabel">Others</div>
                  <div className="costPrice">₹80K–1.5L</div>
                  <div className="costSmall">Hardware + Software</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section features" aria-labelledby="features-title">
          <div className="container">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <motion.h2 id="features-title" className="h2 sectionTitle" variants={fadeUp}>Engineered for Pharmacy Operations</motion.h2>
              <motion.p className="subhead" variants={fadeUp}>
                Efficient inventory & POS, real‑time monitoring, proactive alerts, and complete compliance—backed by edge + cloud architecture.
              </motion.p>
            </motion.div>
            <div className="featuresDiagram">
              <div className="featureStack" role="list" aria-label="Key features">
                {features.map((f, idx) => (
                  <div key={f.title} className="featureItem" role="listitem" style={{ '--feature-index': idx } as React.CSSProperties}>
                    <motion.article className="featureCard" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                      {/* <div className="featureIcon monoIcon" aria-hidden="true" /> */}
                      <h3 className="h3">{f.title}</h3>
                      <p className="featureDesc">{f.desc}</p>
                    </motion.article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Unique Selling Points (8 Points) */}
        <section className="section uniquePoints" aria-labelledby="usp-title">
          <div className="container">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <motion.h2 id="usp-title" className="h2 sectionTitle" variants={fadeUp}>What Makes Us Better</motion.h2>
              <motion.p className="subhead" variants={fadeUp}>What sets Pharmetrix apart from the market.</motion.p>
            </motion.div>
            <div className="uspGrid">
              {uniquePoints.map((point) => (
                <motion.div key={point.letter} className="uspCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                  <div className="uspHeader">
                    <div className="uspLetter" aria-label={`Point ${point.letter}`}>{point.letter}</div>
                    <h3 className="h3 uspTitle">{point.title}</h3>
                  </div>
                  <div className="uspSubtitle">{point.subtitle}</div>
                  <p className="uspDesc">{point.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section howItWorks" aria-labelledby="how-title">
          <div className="container">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <motion.h2 id="how-title" className="h2 sectionTitle" variants={fadeUp}>How It Works</motion.h2>
              <motion.p className="subhead" variants={fadeUp}>Hardware + Software in Perfect Harmony</motion.p>
            </motion.div>

            <div className="workflowDiagram" aria-hidden="false">
              <div className="overlapStack" role="list" aria-label="How it works steps">
                <div className="workflowItem" role="listitem">
                  <motion.div className="workflowCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                    <div className="stepCircle" aria-hidden="true">1</div>
                    <div className="cardContent">
                      <h3 className="cardTitle">Sensors Collect</h3>
                      <p className="cardDesc">Dual temperature sensors + camera continuously monitor fridge and ambient conditions</p>
                    </div>
                  </motion.div>
                </div>

                <div className="workflowItem" role="listitem">
                  <motion.div className="workflowCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                    <div className="stepCircle" aria-hidden="true">2</div>
                    <div className="cardContent">
                      <h3 className="cardTitle">Edge Processes</h3>
                      <p className="cardDesc">Raspberry Pi processes data locally, triggers alerts, and manages batches offline</p>
                    </div>
                  </motion.div>
                </div>

                <div className="workflowItem" role="listitem">
                  <motion.div className="workflowCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                    <div className="stepCircle" aria-hidden="true">3</div>
                    <div className="cardContent">
                      <h3 className="cardTitle">Staff Operates</h3>
                      <p className="cardDesc">Use Quick Sale for fast OTC sales or Proper Sale for Rx. System enforces <span className="noBreak">FEFO</span></p>
                    </div>
                  </motion.div>
                </div>

                <div className="workflowItem" role="listitem">
                  <motion.div className="workflowCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                    <div className="stepCircle" aria-hidden="true">4</div>
                    <div className="cardContent">
                      <h3 className="cardTitle">Cloud Syncs</h3>
                      <p className="cardDesc">Periodic cloud sync for backup, analytics, and compliance reporting</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance & Safety */}
        <section id="compliance" className="section complianceSection" aria-labelledby="compliance-title">
          <div className="container">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
              <motion.h2 id="compliance-title" className="h2 sectionTitle" variants={fadeUp}>Compliance & Safety</motion.h2>
              <motion.p className="subhead" variants={fadeUp}>Built with legal compliance at every layer.</motion.p>
            </motion.div>

            <div className="complianceGrid">
              <motion.div className="complianceCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <div className="complianceNumber">1</div>
                <h3 className="h3">Drugs & Cosmetics Act</h3>
                <p>Digital audit trail for all sales. Prescription validation before Rx dispensing. Schedule X blocked entirely.</p>
              </motion.div>

              <motion.div className="complianceCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <div className="complianceNumber">2</div>
                <h3 className="h3">GST Compliance</h3>
                <p>All transactions logged with timestamp, qty, price, batch. Daily summary for GST filing. Audit-ready exports.</p>
              </motion.div>

              <motion.div className="complianceCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <div className="complianceNumber">3</div>
                <h3 className="h3">Data Security</h3>
                <p>Encrypted transit (HTTPS), at-rest encryption, role-based access, login audit logs, no cloud dependency.</p>
              </motion.div>

              <motion.div className="complianceCard" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <div className="complianceNumber">4</div>
                <h3 className="h3">Operational Safety</h3>
                <p>Dual sensors prevent single-point failure. Automatic alerts. Fallback to manual alerts if network fails.</p>
              </motion.div>
            </div>

            <motion.div className="complianceNote" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <div className="noteContent">
                <strong>Disclaimer:</strong> Pharmetrix assists with compliance but doesn't replace pharmacist expertise. Final responsibility for medicine dispensing rests with qualified pharmacy staff.
              </div>
            </motion.div>
          </div>
        </section>

        {/* Metrics / Social Proof */}
        <section id="metrics" className="section metrics" aria-labelledby="metrics-title">
          <div className="container">
            <h2 id="metrics-title" className="sr-only">Key metrics</h2>
            <div className="metricsRow">
              {metrics.map((m) => (
                <motion.div key={m.label} className="metric" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                  <div className="metricValue">{m.value}</div>
                  <div className="metricLabel">{m.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA */}
        <section id="cta" className="section band" aria-labelledby="cta-title">
          <div className="container">
            <motion.div className="bandInner" initial={{ opacity: 0, scale: .98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }}>
              <h2 id="cta-title" className="h2">Ready to Transform Your Pharmacy?</h2>
              <p className="subhead">Join modern pharmacies automating inventory, ensuring compliance, and delighting customers.</p>
              <Link className="button buttonPrimary" to="/get-started">Get Started Now</Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="footer" role="contentinfo">
        <div className="container footerGrid">
          <div className="footerBrand">
            <img className="footerLogo" src="/title-subtitle-logo.png" alt="Pharmetrix - Smart Pharmacy Management System" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <p className="muted">Unified hardware + software for pharmaceutical automation. Smart inventory management, real-time monitoring, and compliance at 80-90% lower cost.</p>
          </div>

          <nav aria-label="Product Navigation">
            <h3 className="footerHeading">Product</h3>
            <ul className="footerList" role="list">
              <li role="listitem"><a href="#why" title="Learn why choose Pharmetrix">Why Pharmetrix</a></li>
              <li role="listitem"><a href="#features" title="Explore Pharmetrix features">Features</a></li>
              <li role="listitem"><a href="#compliance" title="View compliance information">Compliance</a></li>
              <li role="listitem"><Link to="/get-started" title="Start using Pharmetrix">Get Started</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company Navigation">
            <h3 className="footerHeading">Development</h3>
            <ul className="footerList" role="list">
              <li role="listitem"><Link to="/development" title="About development">About Dev</Link></li>
              <li role="listitem"><Link to="/development" title="Learn about Pharmetrix">About Pharmetrix</Link></li>
              <li role="listitem"><Link to="/development" title="Contact us">Contact</Link></li>
            </ul>
          </nav>

          <nav aria-label="Support Navigation">
            <h3 className="footerHeading">Support</h3>
            <ul className="footerList" role="list">
              <li role="listitem"><Link to="/support" title="Read documentation">Docs</Link></li>
              <li role="listitem"><Link to="/support" title="Access guides">Guides</Link></li>
              <li role="listitem"><Link to="/support" title="Check system status">Status</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal Navigation">
            <h3 className="footerHeading">Legal</h3>
            <ul className="footerList" role="list">
              <li role="listitem"><Link to="/legal" title="Read terms of service">Terms</Link></li>
              <li role="listitem"><Link to="/legal" title="Read privacy policy">Privacy</Link></li>
              <li role="listitem"><Link to="/legal" title="View security information">Security</Link></li>
            </ul>
          </nav>
        </div>
        <div className="copy">
          <p>Copyright © {new Date().getFullYear()} Pharmetrix by Prakhar Tripathi. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}