import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com/silvajeanderson165-creator", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/jeanderson-silva-9a8844386/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:Silvajeanderson165@gmail.com", label: "Email" },
];

export default function Footer() {
  return (
    <motion.footer
      className="relative py-16 px-4 border-t border-[rgba(56,189,248,0.06)]"
      style={{ background: "#070B14" }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-[#F0F9FF] font-bold text-xl mb-1">TrendScope</h3>
            <p className="text-[#475569] text-sm">
              Curadoria inteligente de conteúdo. Desenvolvido com excelência.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="
                  p-2.5 rounded-xl
                  bg-[rgba(56,189,248,0.04)] border border-[rgba(56,189,248,0.08)]
                  text-[#475569] hover:text-[#38BDF8] hover:border-[rgba(56,189,248,0.2)]
                  transition-all duration-200
                "
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[rgba(56,189,248,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#475569]/60 text-xs">
            © {new Date().getFullYear()} TrendScope. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#475569]/60">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistema operacional
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
