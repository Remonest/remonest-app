"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = "en" | "id";

const LANGUAGE_STORAGE_KEY = "remonest-language";

function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "id") {
      return stored;
    }
  }
  return "id"; // Default to Bahasa Indonesia
}

interface Translations {
  header: {
    features: string;
    howItWorks: string;
    successStories: string;
    jobs: string;
    learning: string;
    logIn: string;
    getStartedFree: string;
    menu: string;
  };
  auth: {
    login: {
      title: string;
      description: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      forgotPassword: string;
      signIn: string;
      signingIn: string;
      continueWithGoogle: string;
      noAccount: string;
      signUp: string;
      emailNotConfirmed: string;
      emailNotConfirmedDesc: string;
      resendConfirmation: string;
      sending: string;
      orContinueWith: string;
    };
    register: {
      title: string;
      description: string;
      fullName: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      workTypeLabel: string;
      workTypePlaceholder: string;
      client: string;
      freelancer: string;
      password: string;
      confirmPassword: string;
      createAccount: string;
      creatingAccount: string;
      continueWithGoogle: string;
      hasAccount: string;
      signIn: string;
      passwordStrength: Record<number, string>;
      requirements: {
        length: string;
        lower: string;
        upper: string;
        number: string;
      };
    };
    forgot: {
      title: string;
      description: string;
      emailLabel: string;
      emailPlaceholder: string;
      sendResetLink: string;
      sending: string;
      backToLogin: string;
      successTitle: string;
      successDesc: string;
      emailSent: string;
      emailSentDesc: string;
    };
  };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    getStartedFree: string;
    seeHowItWorks: string;
    stats: {
      remoteRoles: string;
      learningModules: string;
      atsReady: string;
    };
    carousel: {
      workFromAnywhere: {
        caption: string;
        description: string;
      };
      buildStrongerProfile: {
        caption: string;
        description: string;
      };
      showcaseBestWork: {
        caption: string;
        description: string;
      };
      landGlobalOpportunities: {
        caption: string;
        description: string;
      };
    };
  };
  carousel: {
    dashboard: string;
    globalReady: string;
    previousSlide: string;
    nextSlide: string;
    goToSlide: (index: number) => string;
  };
  features: {
    title: string;
    subtitle: string;
    badge: string;
    items: {
      learningModules: {
        title: string;
        description: string;
        alt: string;
      };
      jobBoard: {
        title: string;
        description: string;
        alt: string;
      };
      cvPortfolio: {
        title: string;
        description: string;
        alt: string;
      };
    };
  };
  steps: {
    title: string;
    subtitle: string;
    items: {
      buildProfile: {
        title: string;
        description: string;
        alt: string;
      };
      learnSkills: {
        title: string;
        description: string;
        alt: string;
      };
      applyJobs: {
        title: string;
        description: string;
        alt: string;
      };
    };
  };
  testimonials: {
    title: string;
    subtitle: string;
    main: {
      quote: string;
      name: string;
      role: string;
      alt: string;
    };
    secondary: Array<{
      quote: string;
      name: string;
      role: string;
      alt: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    getStartedFree: string;
  };
  footer: {
    product: string;
    company: string;
    resources: string;
    legal: string;
    allRightsReserved: string;
    description: string;
    links: {
      jobBoard: string;
      learningModules: string;
      portfolioBuilder: string;
      about: string;
      successStories: string;
      contact: string;
      termsConditions: string;
      privacyPolicy: string;
      cookieSettings: string;
    };
    social: {
      twitter: string;
      linkedin: string;
      instagram: string;
    };
  };
  dashboard: {
    title: string;
    nav: {
      overview: string;
      jobPostings: string;
      applications: string;
      settings: string;
      admin: string;
    };
    signOut: string;
    overview: {
      title: string;
      stats: {
        applications: string;
        modulesCompleted: string;
        profileViews: string;
        cvDownloads: string;
      };
      recentActivity: string;
      quickActions: string;
    };
    applications: {
      title: string;
      status: {
        all: string;
        pending: string;
        accepted: string;
        rejected: string;
      };
    };
    jobs: {
      title: string;
      postNew: string;
      viewDetails: string;
      edit: string;
      delete: string;
      noJobs: string;
      noJobsDesc: string;
    };
    settings: {
      title: string;
      subtitle: string;
      profile: string;
      notifications: string;
      appearance: string;
      security: string;
      profileInfo: string;
      fullName: string;
      email: string;
      location: string;
      locationPlaceholder: string;
      role: string;
      rolePlaceholder: string;
      bio: string;
      bioPlaceholder: string;
      saveChanges: string;
      saving: string;
      saved: string;
      notificationPrefs: string;
      emailNotifications: string;
      emailNotificationsDesc: string;
      jobAlerts: string;
      jobAlertsDesc: string;
      learningReminders: string;
      learningRemindersDesc: string;
      marketingEmails: string;
      marketingEmailsDesc: string;
      savePreferences: string;
      light: string;
      dark: string;
      system: string;
      customizeTheme: string;
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
      updatePassword: string;
      updating: string;
      updated: string;
    };
  };
  notFound: {
    badge: string;
    kicker: string;
    code: string;
    title: string;
    description: string;
    returnDashboard: string;
    goBack: string;
    progressSafe: string;
    contactSupport: string;
    recommendedTitle: string;
    recommendedChip: string;
    links: {
      dashboard: {
        title: string;
        description: string;
      };
      jobs: {
        title: string;
        description: string;
      };
      portfolio: {
        title: string;
        description: string;
      };
      support: {
        title: string;
        description: string;
      };
    };
  };
}

const translations: Record<Language, Translations> = {
  en: {
    header: {
      features: "Features",
      howItWorks: "How it works",
      successStories: "Success stories",
      jobs: "Jobs",
      learning: "Learning",
      logIn: "Log In",
      getStartedFree: "Get Started Free",
      menu: "Menu",
    },
    auth: {
      login: {
        title: "Welcome back",
        description: "Enter your email to sign in to your account",
        email: "Email",
        emailPlaceholder: "name@example.com",
        password: "Password",
        forgotPassword: "Forgot password?",
        signIn: "Sign In",
        signingIn: "Signing in…",
        continueWithGoogle: "Continue with Google",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
        emailNotConfirmed: "Email not confirmed",
        emailNotConfirmedDesc:
          "A confirmation email was sent to {email}. Please check your inbox and spam folder.",
        resendConfirmation: "Resend confirmation email",
        sending: "Sending...",
        orContinueWith: "or continue with",
      },
      register: {
        title: "Create an account",
        description: "Enter your details to get started",
        fullName: "Full Name",
        namePlaceholder: "John Doe",
        email: "Email",
        emailPlaceholder: "name@example.com",
        workTypeLabel: "I want to work as",
        workTypePlaceholder: "Select your work type",
        client: "Company — Post jobs and hire",
        freelancer: "Freelancer — Find remote work",
        password: "Password",
        confirmPassword: "Confirm Password",
        createAccount: "Create Account",
        creatingAccount: "Creating account…",
        continueWithGoogle: "Continue with Google",
        hasAccount: "Already have an account?",
        signIn: "Sign in",
        passwordStrength: {
          0: "Very weak",
          1: "Weak",
          2: "Fair",
          3: "Good",
          4: "Strong",
        },
        requirements: {
          length: "8+ characters",
          lower: "Lowercase",
          upper: "Uppercase",
          number: "Number",
        },
      },
      forgot: {
        title: "Reset password",
        description: "Enter your email and we'll send you a reset link.",
        emailLabel: "Email",
        emailPlaceholder: "name@example.com",
        sendResetLink: "Send Reset Link",
        sending: "Sending…",
        backToLogin: "Back to login",
        successTitle: "Check your email",
        successDesc: "We've sent a reset link",
        emailSent: "Email sent",
        emailSentDesc:
          "Check your inbox and spam folder. The link expires in 1 hour.",
      },
    },
    hero: {
      badge: "Built for Indonesian professionals",
      title: "Start and grow your",
      titleHighlight: "remote career",
      description:
        "Find global opportunities, sharpen remote-ready skills, and build a profile that helps you stand out to international employers.",
      getStartedFree: "Get Started Free",
      seeHowItWorks: "See how it works",
      stats: {
        remoteRoles: "Remote roles weekly",
        learningModules: "Learning modules",
        atsReady: "CV and portfolio tools",
      },
      carousel: {
        workFromAnywhere: {
          caption: "Work from anywhere",
          description:
            "Discover a more flexible path for ambitious professionals in Indonesia.",
        },
        buildStrongerProfile: {
          caption: "Build a stronger profile",
          description:
            "Create CVs and portfolios that feel clear, polished, and global-ready.",
        },
        showcaseBestWork: {
          caption: "Showcase your best work",
          description:
            "Present projects in a clean, professional format that impresses employers.",
        },
        landGlobalOpportunities: {
          caption: "Land global opportunities",
          description:
            "Move from learning to applying with confidence on verified remote roles.",
        },
      },
    },
    carousel: {
      dashboard: "Remote career dashboard",
      globalReady: "Global-ready profile",
      previousSlide: "Previous slide",
      nextSlide: "Next slide",
      goToSlide: (index: number) => `Go to slide ${index}`,
    },
    features: {
      title: "Features",
      subtitle: "Everything you need to launch and grow your remote career",
      badge: "Simple sections, shadcn-inspired",
      items: {
        learningModules: {
          title: "Learning Modules",
          description:
            "Follow focused lessons on async communication, global hiring expectations, and practical remote work habits for Indonesian talent.",
          alt: "Learning modules preview",
        },
        jobBoard: {
          title: "Job Board",
          description:
            "Explore verified remote opportunities from international teams open to hiring professionals based in Indonesia.",
          alt: "Job board preview",
        },
        cvPortfolio: {
          title: "CV & Portfolio Builder",
          description:
            "Create structured, ATS-friendly career assets with a polished format that feels professional from first draft.",
          alt: "CV and portfolio builder preview",
        },
      },
    },
    steps: {
      title: "How it works",
      subtitle: "Three simple steps to start your remote journey",
      items: {
        buildProfile: {
          title: "Build your profile",
          description:
            "Set up your CV, portfolio, and strengths in a format that matches what remote teams want to review quickly.",
          alt: "Build profile preview",
        },
        learnSkills: {
          title: "Learn remote-ready skills",
          description:
            "Use short modules to improve communication, collaboration, and confidence before applying to global companies.",
          alt: "Learning remote skills preview",
        },
        applyJobs: {
          title: "Apply to verified jobs",
          description:
            "Browse curated listings, prepare with confidence, and submit applications to companies already open to remote hiring.",
          alt: "Apply to jobs preview",
        },
      },
    },
    testimonials: {
      title: "Success stories",
      subtitle: "See how others have transformed their careers",
      main: {
        quote:
          "Remonest helped me restructure my portfolio and present my experience more clearly. Within weeks, I started getting interviews from companies outside Indonesia.",
        name: "Nadia S.",
        role: "Product Designer · Remote startup team",
        alt: "Nadia avatar",
      },
      secondary: [
        {
          quote:
            "The modules were practical and easy to follow. I finally understood how to position my experience for global remote roles.",
          name: "Budi P.",
          role: "Frontend Developer",
          alt: "Budi avatar",
        },
        {
          quote:
            "I used the CV builder and job board together. It made the whole process feel organized instead of overwhelming.",
          name: "Maya A.",
          role: "Digital Marketer",
          alt: "Maya avatar",
        },
      ],
    },
    cta: {
      title: "Ready to start your remote journey?",
      subtitle:
        "Join thousands of Indonesian professionals who are already working with global companies.",
      getStartedFree: "Get Started Free",
    },
    footer: {
      product: "Product",
      company: "Company",
      resources: "Resources",
      legal: "Legal",
      allRightsReserved: "All rights reserved",
      description:
        "Empowering Indonesian professionals to build sustainable remote careers with practical tools and global-ready guidance.",
      links: {
        jobBoard: "Job Board",
        learningModules: "Learning Modules",
        portfolioBuilder: "Portfolio Builder",
        about: "About",
        successStories: "Success Stories",
        contact: "Contact",
        termsConditions: "Terms & Conditions",
        privacyPolicy: "Privacy Policy",
        cookieSettings: "Cookie Settings",
      },
      social: {
        twitter: "X (Twitter)",
        linkedin: "LinkedIn",
        instagram: "Instagram",
      },
    },
    dashboard: {
      title: "Dashboard",
      nav: {
        overview: "Overview",
        jobPostings: "Job Postings",
        applications: "Applications",
        settings: "Settings",
        admin: "Admin",
      },
      signOut: "Sign Out",
      overview: {
        title: "Overview",
        stats: {
          applications: "Applications",
          modulesCompleted: "Modules Completed",
          profileViews: "Profile Views",
          cvDownloads: "CV Downloads",
        },
        recentActivity: "Recent Activity",
        quickActions: "Quick Actions",
      },
      applications: {
        title: "Applications",
        status: {
          all: "All",
          pending: "Pending",
          accepted: "Accepted",
          rejected: "Rejected",
        },
      },
      jobs: {
        title: "Job Postings",
        postNew: "Post New Job",
        viewDetails: "View Details",
        edit: "Edit",
        delete: "Delete",
        noJobs: "No job postings yet",
        noJobsDesc:
          "Start by posting your first job opening. Attract qualified candidates from across Indonesia.",
      },
      settings: {
        title: "Settings",
        subtitle: "Manage your profile, preferences, and account settings.",
        profile: "Profile",
        notifications: "Notifications",
        appearance: "Appearance",
        security: "Security",
        profileInfo: "Profile Information",
        fullName: "Full Name",
        email: "Email",
        location: "Location",
        locationPlaceholder: "Jakarta, Indonesia",
        role: "Role",
        rolePlaceholder: "Frontend Developer",
        bio: "Bio",
        bioPlaceholder: "Tell us about yourself...",
        saveChanges: "Save Changes",
        saving: "Saving...",
        saved: "Profile saved successfully",
        notificationPrefs: "Notification Preferences",
        emailNotifications: "Email notifications",
        emailNotificationsDesc:
          "Receive updates about your applications via email",
        jobAlerts: "Job alerts",
        jobAlertsDesc: "Get notified when new jobs match your profile",
        learningReminders: "Learning reminders",
        learningRemindersDesc: "Reminders to continue your learning modules",
        marketingEmails: "Marketing emails",
        marketingEmailsDesc: "Receive tips, news, and product updates",
        savePreferences: "Save Preferences",
        light: "Light",
        dark: "Dark",
        system: "System",
        customizeTheme: "Customize how Remonest looks on your device.",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        updatePassword: "Update Password",
        updating: "Updating...",
        updated: "Password updated successfully",
      },
    },
  },
  notFound: {
    badge: "Navigation error",
    kicker: "404 · page unavailable",
    code: "404",
    title: "This destination is unavailable, but your dashboard is still within reach",
    description:
      "The page may have moved or no longer exist. Continue from your dashboard, jump into a key workspace, or review the most useful routes below.",
    returnDashboard: "Return to Dashboard",
    goBack: "Go back",
    progressSafe: "Your saved progress is unaffected",
    contactSupport: "support@remonest.com",
    recommendedTitle: "Continue from a trusted route",
    recommendedChip: "Premium recovery",
    links: {
      dashboard: {
        title: "Open dashboard",
        description:
          "Go back to your main workspace and continue from your latest activity.",
      },
      jobs: {
        title: "View jobs",
        description:
          "Browse active roles and return to a stable part of the platform.",
      },
      portfolio: {
        title: "Open portfolio builder",
        description:
          "Continue refining your profile and application materials.",
      },
      support: {
        title: "Contact support",
        description:
          "Report this broken route if the page should still be available.",
      },
    },
  },
  id: {
    header: {
      features: "Fitur",
      howItWorks: "Cara kerja",
      successStories: "Kisah sukses",
      jobs: "Lowongan",
      learning: "Pembelajaran",
      logIn: "Masuk",
      getStartedFree: "Mulai Gratis",
      menu: "Menu",
    },
    auth: {
      login: {
        title: "Selamat datang kembali",
        description: "Masukkan email Anda untuk masuk ke akun",
        email: "Email",
        emailPlaceholder: "nama@contoh.com",
        password: "Kata Sandi",
        forgotPassword: "Lupa kata sandi?",
        signIn: "Masuk",
        signingIn: "Memasuki akun…",
        continueWithGoogle: "Lanjutkan dengan Google",
        noAccount: "Belum punya akun?",
        signUp: "Daftar",
        emailNotConfirmed: "Email belum dikonfirmasi",
        emailNotConfirmedDesc:
          "Email konfirmasi telah dikirim ke {email}. Silakan periksa kotak masuk dan folder spam Anda.",
        resendConfirmation: "Kirim ulang email konfirmasi",
        sending: "Mengirim...",
        orContinueWith: "atau lanjutkan dengan",
      },
      register: {
        title: "Buat akun",
        description: "Masukkan detail Anda untuk memulai",
        fullName: "Nama Lengkap",
        namePlaceholder: "John Doe",
        email: "Email",
        emailPlaceholder: "nama@contoh.com",
        workTypeLabel: "Saya ingin bekerja sebagai",
        workTypePlaceholder: "Pilih jenis pekerjaan",
        client: "Perusahaan — Posting lowongan dan rekrut",
        freelancer: "Freelancer — Cari pekerjaan remote",
        password: "Kata Sandi",
        confirmPassword: "Konfirmasi Kata Sandi",
        createAccount: "Buat Akun",
        creatingAccount: "Membuat akun…",
        continueWithGoogle: "Lanjutkan dengan Google",
        hasAccount: "Sudah punya akun?",
        signIn: "Masuk",
        passwordStrength: {
          0: "Sangat lemah",
          1: "Lemah",
          2: "Cukup",
          3: "Bagus",
          4: "Kuat",
        },
        requirements: {
          length: "8+ karakter",
          lower: "Huruf kecil",
          upper: "Huruf besar",
          number: "Angka",
        },
      },
      forgot: {
        title: "Atur ulang kata sandi",
        description:
          "Masukkan email Anda dan kami akan mengirimkan tautan atur ulang.",
        emailLabel: "Email",
        emailPlaceholder: "nama@contoh.com",
        sendResetLink: "Kirim Tautan Atur Ulang",
        sending: "Mengirim…",
        backToLogin: "Kembali ke halaman login",
        successTitle: "Periksa email Anda",
        successDesc: "Kami telah mengirimkan tautan atur ulang ke",
        emailSent: "Email terkirim",
        emailSentDesc:
          "Periksa kotak masuk dan folder spam Anda. Tautan akan kedaluwarsa dalam 1 jam.",
      },
    },
    hero: {
      badge: "Dibuat untuk profesional Indonesia",
      title: "Mulai dan kembangkan",
      titleHighlight: "karir remote Anda",
      description:
        "Temukan peluang global, tingkatkan keterampilan siap-remote, dan bangun profil yang membantu Anda menonjol di mata perusahaan internasional.",
      getStartedFree: "Mulai Gratis",
      seeHowItWorks: "Lihat cara kerjanya",
      stats: {
        remoteRoles: "Lowongan remote per minggu",
        learningModules: "Modul pembelajaran",
        atsReady: "CV dan portofolio",
      },
      carousel: {
        workFromAnywhere: {
          caption: "Kerja dari mana saja",
          description:
            "Temukan jalur karir yang lebih fleksibel untuk profesional Indonesia yang berambisi.",
        },
        buildStrongerProfile: {
          caption: "Bangun profil yang lebih kuat",
          description:
            "Buat CV dan portofolio yang jelas, rapi, dan siap untuk pasar global.",
        },
        showcaseBestWork: {
          caption: "Tampilkan karya terbaik Anda",
          description:
            "Sajikan proyek dalam format yang bersih dan profesional untuk memukau pemberi kerja.",
        },
        landGlobalOpportunities: {
          caption: "Raih peluang global",
          description:
            "Berani melamar ke pekerjaan remote terverifikasi setelah melalui pembelajaran.",
        },
      },
    },
    carousel: {
      dashboard: "Dasbor karir remote",
      globalReady: "Profil siap global",
      previousSlide: "Slide sebelumnya",
      nextSlide: "Slide berikutnya",
      goToSlide: (index: number) => `Ke slide ${index}`,
    },
    features: {
      title: "Fitur",
      subtitle:
        "Semua yang Anda butuhkan untuk memulai dan mengembangkan karir remote",
      badge: "Bagian sederhana, terinspirasi shadcn",
      items: {
        learningModules: {
          title: "Modul Pembelajaran",
          description:
            "Ikuti pelajaran terfokus tentang komunikasi asinkron, ekspektasi perekrutan global, dan kebiasaan kerja remote praktis untuk talenta Indonesia.",
          alt: "Pratinjau modul pembelajaran",
        },
        jobBoard: {
          title: "Papan Lowongan",
          description:
            "Jelajahi peluang remote terverifikasi dari perusahaan internasional yang terbuka untuk merekrut profesional di Indonesia.",
          alt: "Pratinjau papan lowongan",
        },
        cvPortfolio: {
          title: "Pembuat CV & Portofolio",
          description:
            "Buat CV dan portofolio terstruktur yang ramah-ATS dengan format profesional sejak draf pertama.",
          alt: "Pratinjau pembuat CV dan portofolio",
        },
      },
    },
    steps: {
      title: "Cara kerja",
      subtitle: "Tiga langkah mudah untuk memulai perjalanan remote Anda",
      items: {
        buildProfile: {
          title: "Buat profil Anda",
          description:
            "Siapkan CV, portofolio, dan keunggulan Anda dalam format yang sesuai dengan kebutuhan tim remote untuk penilaian cepat.",
          alt: "Pratinjau pembuatan profil",
        },
        learnSkills: {
          title: "Pelajari keterampilan siap-remote",
          description:
            "Gunakan modul-modul singkat untuk meningkatkan komunikasi, kolaborasi, dan kepercayaan diri sebelum melamar ke perusahaan global.",
          alt: "Pratinjau pembelajaran keterampilan remote",
        },
        applyJobs: {
          title: "Lamar ke pekerjaan terverifikasi",
          description:
            "Telusuri daftar lowongan terkurasi, persiapkan diri dengan percaya diri, dan kirim lamaran ke perusahaan yang sudah terbuka untuk perekrutan remote.",
          alt: "Pratinjau pelamaran pekerjaan",
        },
      },
    },
    testimonials: {
      title: "Kisah sukses",
      subtitle: "Lihat bagaimana orang lain telah mengubah karir mereka",
      main: {
        quote:
          "Remonest membantu saya menata ulang portofolio dan menyajikan pengalaman saya dengan lebih jelas. Dalam beberapa minggu, saya mulai mendapat wawancara dari perusahaan di luar Indonesia.",
        name: "Nadia S.",
        role: "Desainer Produk · Tim startup remote",
        alt: "Avatar Nadia",
      },
      secondary: [
        {
          quote:
            "Modul-modulnya praktis dan mudah diikuti. Saya akhirnya memahami bagaimana memposisikan pengalaman saya untuk peran remote global.",
          name: "Budi P.",
          role: "Pengembang Frontend",
          alt: "Avatar Budi",
        },
        {
          quote:
            "Saya menggunakan pembuat CV dan papan lowongan bersamaan. Itu membuat seluruh proses terasa terorganisir, bukan membingungkan.",
          name: "Maya A.",
          role: "Pemasar Digital",
          alt: "Avatar Maya",
        },
      ],
    },
    cta: {
      title: "Siap memulai perjalanan remote Anda?",
      subtitle:
        "Bergabunglah dengan ribuan profesional Indonesia yang sudah bekerja dengan perusahaan global.",
      getStartedFree: "Mulai Gratis",
    },
    footer: {
      product: "Produk",
      company: "Perusahaan",
      resources: "Sumber Daya",
      legal: "Legal",
      allRightsReserved: "Hak cipta dilindungi",
      description:
        "Memberdayakan profesional Indonesia untuk membangun karir remote yang berkelanjutan dengan alat praktis dan panduan siap global.",
      links: {
        jobBoard: "Papan Lowongan",
        learningModules: "Modul Pembelajaran",
        portfolioBuilder: "Pembuat Portofolio",
        about: "Tentang",
        successStories: "Kisah Sukses",
        contact: "Hubungi Kami",
        termsConditions: "Syarat & Ketentuan",
        privacyPolicy: "Kebijakan Privasi",
        cookieSettings: "Pengaturan Cookie",
      },
      social: {
        twitter: "X (Twitter)",
        linkedin: "LinkedIn",
        instagram: "Instagram",
      },
    },
    dashboard: {
      title: "Dasbor",
      nav: {
        overview: "Ringkasan",
        jobPostings: "Lowongan Kerja",
        applications: "Lamaran",
        settings: "Pengaturan",
        admin: "Admin",
      },
      signOut: "Keluar",
      overview: {
        title: "Ringkasan",
        stats: {
          applications: "Lamaran",
          modulesCompleted: "Modul Selesai",
          profileViews: "Profil Dilihat",
          cvDownloads: "CV Diunduh",
        },
        recentActivity: "Aktivitas Terbaru",
        quickActions: "Aksi Cepat",
      },
      applications: {
        title: "Lamaran",
        status: {
          all: "Semua",
          pending: "Menunggu",
          accepted: "Diterima",
          rejected: "Ditolak",
        },
      },
      jobs: {
        title: "Lowongan Kerja",
        postNew: "Pasang Lowongan Baru",
        viewDetails: "Lihat Detail",
        edit: "Edit",
        delete: "Hapus",
        noJobs: "Belum ada lowongan kerja",
        noJobsDesc:
          "Mulai dengan memasang lowongan kerja pertama Anda. Tarik kandidat berkualitas dari seluruh Indonesia.",
      },
      settings: {
        title: "Pengaturan",
        subtitle: "Kelola profil, preferensi, dan pengaturan akun Anda.",
        profile: "Profil",
        notifications: "Notifikasi",
        appearance: "Tampilan",
        security: "Keamanan",
        profileInfo: "Informasi Profil",
        fullName: "Nama Lengkap",
        email: "Email",
        location: "Lokasi",
        locationPlaceholder: "Jakarta, Indonesia",
        role: "Jabatan",
        rolePlaceholder: "Pengembang Frontend",
        bio: "Bio",
        bioPlaceholder: "Ceritakan tentang diri Anda...",
        saveChanges: "Simpan Perubahan",
        saving: "Menyimpan...",
        saved: "Profil berhasil disimpan",
        notificationPrefs: "Preferensi Notifikasi",
        emailNotifications: "Notifikasi email",
        emailNotificationsDesc:
          "Terima pembaruan tentang lamaran Anda melalui email",
        jobAlerts: "Pencarian kerja",
        jobAlertsDesc:
          "Dapatkan pemberitahuan saat pekerjaan baru sesuai dengan profil Anda",
        learningReminders: "Pengingat pembelajaran",
        learningRemindersDesc:
          "Pengingat untuk melanjutkan modul pembelajaran Anda",
        marketingEmails: "Email pemasaran",
        marketingEmailsDesc: "Terima tips, berita, dan pembaruan produk",
        savePreferences: "Simpan Preferensi",
        light: "Terang",
        dark: "Gelap",
        system: "Sistem",
        customizeTheme: "Sesuaikan tampilan Remonest di perangkat Anda.",
        currentPassword: "Kata Sandi Saat Ini",
        newPassword: "Kata Sandi Baru",
        confirmNewPassword: "Konfirmasi Kata Sandi Baru",
        updatePassword: "Perbarui Kata Sandi",
        updating: "Memperbarui...",
        updated: "Kata sandi berhasil diperbarui",
      },
    },
  },
  notFound: {
    badge: "Kesalahan navigasi",
    kicker: "404 · halaman tidak tersedia",
    code: "404",
    title: "Halaman ini tidak tersedia, tetapi dasbor Anda masih dapat dijangkau",
    description:
      "Halaman mungkin telah berpindah atau tidak ada lagi. Lanjutkan dari dasbor Anda, masuk ke ruang kerja utama, atau tinjau rute paling berguna di bawah ini.",
    returnDashboard: "Kembali ke Dasbor",
    goBack: "Kembali",
    progressSafe: "Progress tersimpan Anda tidak terpengaruh",
    contactSupport: "support@remonest.com",
    recommendedTitle: "Lanjutkan dari rute terpercaya",
    recommendedChip: "Pemulihan premium",
    links: {
      dashboard: {
        title: "Buka dasbor",
        description:
          "Kembali ke ruang kerja utama Anda dan lanjutkan dari aktivitas terbaru.",
      },
      jobs: {
        title: "Lihat lowongan",
        description:
          "Jelajahi role aktif dan kembali ke bagian platform yang stabil.",
      },
      portfolio: {
        title: "Buka pembuat portofolio",
        description:
          "Lanjutkan menyempurnakan profil dan materi lamaran Anda.",
      },
      support: {
        title: "Hubungi dukungan",
        description:
          "Laporkan rute yang rusak ini jika halaman seharusnya masih tersedia.",
      },
    },
  },
};

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const currentTranslations = translations[language];

  // Persist language to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  // Wrapper for setLanguage to ensure it's typed correctly
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const contextValue = {
    language,
    setLanguage,
    t: currentTranslations,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslations must be used within a TranslationProvider",
    );
  }
  return context;
}

export type { Language };
