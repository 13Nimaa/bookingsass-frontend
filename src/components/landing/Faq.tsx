"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import {
  EASE,
  REVEAL_VIEWPORT,
  createContainerVariants,
  createHeadlineVariants,
  createItemVariants,
} from "./motion";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "این سیستم دقیقاً چه کاری برای آرایشگاه من انجام می‌دهد؟",
    answer:
      "با این سیستم می‌توانید مشتریان، نوبت‌ها، خدمات و سوابق مراجعه را در یک محیط ساده مدیریت کنید و نظم بیشتری به روند کاری آرایشگاه بدهید.",
  },
  {
    question: "آیا مشتریان هم می‌توانند به صورت آنلاین نوبت رزرو کنند؟",
    answer:
      "بله. مشتری می‌تواند از طریق صفحه اختصاصی آرایشگاه، خدمات و زمان‌های قابل رزرو را مشاهده کرده و نوبت خود را ثبت کند.",
  },
  {
    question: "آیا برای استفاده از سیستم نیاز به نصب برنامه دارم؟",
    answer:
      "خیر. سیستم کاملاً تحت وب است و از طریق موبایل، تبلت یا کامپیوتر می‌توانید به آن دسترسی داشته باشید.",
  },
  {
    question: "آیا می‌توانم اطلاعات و سوابق مشتریانم را مدیریت کنم؟",
    answer:
      "بله. اطلاعات مشتریان، سوابق مراجعه، نوبت‌ها و اطلاعات مرتبط با خدمات در پنل مدیریت قابل مشاهده و مدیریت هستند.",
  },
  {
    question: "آیا می‌توانم خدمات و قیمت‌های آرایشگاه را خودم تغییر دهم؟",
    answer:
      "بله. می‌توانید خدمات، قیمت‌ها، مدت زمان هر خدمت و سایر اطلاعات مربوط به آرایشگاه را از پنل مدیریت به‌روزرسانی کنید.",
  },
  {
    question: "آیا امکان مدیریت چند آرایشگر وجود دارد؟",
    answer:
      "بله. می‌توانید اعضای تیم و آرایشگران مختلف را مدیریت کرده و برنامه کاری و نوبت‌های آن‌ها را سامان‌دهی کنید.",
  },
  {
    question: "آیا اطلاعات مشتریان من امن است؟",
    answer:
      "امنیت اطلاعات و دسترسی‌ها یکی از بخش‌های اصلی سیستم است و اطلاعات هر آرایشگاه فقط در اختیار کاربران مجاز آن قرار می‌گیرد.",
  },
  {
    question: "آیا می‌توانم قبل از خرید سیستم را امتحان کنم؟",
    answer:
      "بله. در صورت فعال بودن دوره آزمایشی، می‌توانید قبل از انتخاب پلن، امکانات سیستم را بررسی و تجربه کنید.",
  },
];

function FaqAccordion({
  item,
  index,
  isOpen,
  onToggle,
  reduceMotion,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  const questionId = `faq-question-${index}`;
  const answerId = `faq-answer-${index}`;

  return (
    <div className="group rounded-xl border border-border bg-surface shadow-sm transition duration-200 hover:border-border-strong motion-reduce:transition-none">
      <h3>
        <button
          type="button"
          id={questionId}
          aria-expanded={isOpen}
          aria-controls={answerId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-6 sm:py-5"
        >
          <span className="text-[15px] font-semibold leading-7 text-text-primary sm:text-base">
            {item.question}
          </span>
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center text-muted transition-colors duration-150 group-hover:text-primary"
          >
            {isOpen ? (
              <Minus className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Plus className="h-5 w-5" strokeWidth={2} />
            )}
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={questionId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: EASE,
            }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-7 text-text-secondary sm:px-6 sm:pb-5 sm:text-[15px]">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const reduceMotionPref = useReducedMotion();
  const reduceMotion = reduceMotionPref ?? false;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const containerVariants = createContainerVariants(0.06);
  const itemVariants = createItemVariants(reduceMotion);
  const headlineVariants = createHeadlineVariants(reduceMotion);

  return (
    <section id="faq" aria-labelledby="faq-heading" className="w-full">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <motion.h2
            id="faq-heading"
            variants={headlineVariants}
            className="text-[28px] font-bold leading-[1.5] text-text-primary sm:text-[36px] sm:leading-[1.45] lg:text-[40px]"
          >
            سوالات متداول
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-[560px] text-[15px] leading-8 text-text-secondary sm:mt-4 sm:text-base"
          >
            پاسخ سوالات رایج درباره مدیریت نوبت‌ها، مشتریان و امکانات سیستم
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mx-auto mt-10 w-full max-w-[900px] space-y-3 sm:mt-12"
        >
          {FAQ_ITEMS.map((item, index) => (
            <motion.div key={item.question} variants={itemVariants}>
              <FaqAccordion
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                reduceMotion={reduceMotion}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center text-center sm:mt-16"
        >
          <span
            aria-hidden="true"
            className="mb-6 block h-px w-12 bg-border sm:mb-8"
          />

          <p className="text-lg font-semibold leading-9 text-text-primary sm:text-xl">
            هنوز سوالی دارید؟
          </p>

          <p className="mt-2 max-w-xl text-sm leading-7 text-text-secondary sm:text-[15px]">
            اگر سوال دیگری دارید، با ما در ارتباط باشید.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md active:translate-y-0 active:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            تماس با ما
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
