import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Image
            src="/logo.png"
            alt="LabScity logo"
            height={150}
            width={150}
            priority
            className={styles.logo}
          />
        </div>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.signIn}>
            Sign in
          </Link>
          <Link href="/signup" className={styles.joinNow}>
            Join now
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Welcome to
          <br />
          <span>LabScity</span>
        </h1>
      </section>

      <section className={styles.exploreSection}>
        <div className={styles.exploreGrid}>
          <div>
            <h2 className={styles.exploreTitle}>Explore Top Content</h2>
            <p className={styles.exploreDescription}>Discover top research, insights, and breakthroughs from across the scientific community</p>
          </div>

          <div className={styles.categoryGroup}>
            <Link href="/discover" className={styles.category}>Biology</Link>
            <Link href="/discover" className={styles.category}>Computer Science</Link>
            <Link href="/discover" className={styles.category}>Quantum Physics</Link>
            <Link href="/discover" className={styles.category}>Psychology</Link>
            <Link href="/discover" className={styles.category}>Show all</Link>
          </div>
        </div>
      </section>

      <section className={styles.audienceSection}>
        <div className={styles.audienceGrid}>
          <div className={styles.audienceLeft}>
            <div className={styles.audienceText}>
              <h2>Who is LabScity for?</h2>
              <p>Anyone looking to explore, share, and grow within the scientific community.</p>

              <div className={styles.audienceActions}>
                <Link href="/discover" className={styles.audienceAction}>
                  Find researchers →
                </Link>
                <Link href="/discover" className={styles.audienceAction}>
                  Explore projects →
                </Link>
                <Link href="/discover" className={styles.audienceAction}>
                  Discover new research →
                </Link>
              </div>
            </div>
          </div>
          
          <div className={styles.audienceImageWrapper}>
            <Image
              src="/landing-page-collab.png"
              alt="Researchers collaborating"
              fill
              className={styles.audienceImage}
              priority
            />
          </div>
        </div>
      </section>
    </div>
  );
}
