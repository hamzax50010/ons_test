const values = [
  {
    number: "01",
    title: "اهتمام يبدأ بالوضوح",
    description: "تفاصيل الخدمة وطريقة الطلب لازم يكونوا واضحين قبل ما تاخد قرارك.",
  },
  {
    number: "02",
    title: "خصوصية واهتمام",
    description: "نتعامل مع بياناتك واحتياجك الصحي بمسؤولية واهتمام بالتفاصيل.",
  },
  {
    number: "03",
    title: "خطوات أسهل",
    description: "هدفنا تسهيل الوصول إلى الخدمات الصحية والتمريضية المتاحة.",
  },
];

export default function HomePage() {
  return (
    <div className="site-shell" lang="ar" dir="rtl">
      <div className="topbar">أُنس | ONS Healthcare — لأن صحتك تستحق الأفضل.</div>

      <header className="nav-wrap">
        <a className="brand" href="/" aria-label="أُنس ONS Healthcare - الرئيسية">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">
            <strong>أُنس</strong>
            <span>ONS HEALTHCARE</span>
          </span>
        </a>

        <nav className="nav-links" aria-label="التنقل الرئيسي">
          <a href="#about">عن أُنس</a>
          <a href="#values">مبادئنا</a>
          <a href="#services">الخدمات</a>
        </nav>

        <a className="nav-cta" href="#services">استكشف الخدمات</a>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">ONS HEALTHCARE · صحة باهتمام إنساني</span>
            <h1 id="hero-title">لأن صحتك <span>تستحق الأفضل.</span></h1>
            <p>
              أُنس يسهّل عليك التعرّف على الخدمات الصحية والتمريضية المتاحة،
              بخطوات واضحة واهتمام بالتفاصيل من أول تواصل.
            </p>
            <div className="hero-actions">
              <a className="primary-cta" href="#services">استكشف الخدمات <span aria-hidden="true">←</span></a>
              <a className="secondary-cta" href="#about">تعرّف على أُنس</a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-card">
              <div className="art-symbol">أ</div>
              <div>
                <strong>أُنس | ONS Healthcare</strong>
                <p>لأن صحتك تستحق الأفضل.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="section-heading">
            <span className="eyebrow">ABOUT ONS</span>
            <h2>الصحة مش مجرد خدمة.</h2>
            <p>الثقة والوضوح والاهتمام بالتفاصيل جزء أساسي من التجربة اللي بنسعى نقدمها.</p>
          </div>
          <div className="migration-note">
            دي النسخة التأسيسية من مشروع Next.js على فرع منفصل. محتوى الموقع الفعلي، الخدمات من Firestore،
            نموذج الطلب، تسجيل الدخول ولوحة الإدارة هيتنقلوا على مراحل بعد مراجعة الكود الحالي.
          </div>
        </section>

        <section className="section" id="values">
          <div className="section-heading">
            <span className="eyebrow">OUR PRINCIPLES</span>
            <h2>تجربة أوضح، وخطوات أبسط.</h2>
          </div>
          <div className="value-grid">
            {values.map((value) => (
              <article className="value-card" key={value.number}>
                <span className="value-number">{value.number}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="services">
          <div className="section-heading">
            <span className="eyebrow">SERVICES</span>
            <h2>الخدمات المتاحة</h2>
            <p>سيتم ربط هذا القسم ببيانات الخدمات الفعلية من Firestore في المرحلة التالية، حتى لا نعرض خدمة غير مؤكدة.</p>
          </div>
          <div className="migration-note">
            لم يتم ربط قاعدة البيانات في هذه النسخة التأسيسية بعد. لا تستخدم هذه الصفحة كنسخة إنتاجية قبل إكمال النقل والاختبارات.
          </div>
        </section>
      </main>

      <footer className="footer">
        <strong>أُنس | ONS Healthcare</strong> — لأن صحتك تستحق الأفضل.
      </footer>
    </div>
  );
}
