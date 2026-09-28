'use client';

import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  MousePointerClick, 
  Monitor, 
  CheckSquare, 
  MessageSquare,
  Eye,
  CheckCircle
} from 'lucide-react';

const steps = [
  {
    id: 1,
    role: 'OWNER',
    title: 'Create Campaign',
    description: 'Define the target URL and tasks you want users to complete.',
    icon: PlusCircle,
  },
  {
    id: 2,
    role: 'TESTER',
    title: 'Claim Job',
    description: 'Testers discover and claim available testing jobs on the platform.',
    icon: MousePointerClick,
  },
  {
    id: 3,
    role: 'TESTER',
    title: 'Extension Activates',
    description: 'The Chrome Extension overlay activates directly on the target website.',
    icon: Monitor,
  },
  {
    id: 4,
    role: 'TESTER',
    title: 'Complete Tasks',
    description: 'Tester completes tasks and provides real-time feedback through the overlay.',
    icon: CheckSquare,
  },
  {
    id: 5,
    role: 'TESTER',
    title: 'Submit Response',
    description: 'The completed session and feedback are submitted back to the platform.',
    icon: MessageSquare,
  },
  {
    id: 6,
    role: 'OWNER',
    title: 'Review Feedback',
    description: 'Owner reviews the actionable feedback provided by the tester.',
    icon: Eye,
  },
  {
    id: 7,
    role: 'OWNER',
    title: 'Approve / Reject',
    description: 'Approve satisfactory tests to finalize the testing loop.',
    icon: CheckCircle,
  }
];

export function WorkflowStory() {
  return (
    <section id="how-it-works" className="py-32 bg-surface border-y border-border relative">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight mb-4"
          >
            How it works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted"
          >
            A seamless bridge between your team and real users.
          </motion.p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2"></div>

          <div className="space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="relative flex items-center md:justify-between w-full flex-col md:flex-row gap-8 md:gap-0"
                >
                  {/* Left Side */}
                  <div className={`w-full md:w-[45%] flex ${isEven ? 'md:justify-end' : 'md:justify-start order-1 md:order-2'} pl-16 md:pl-0`}>
                    <div className="bg-background border border-border p-6 rounded-2xl shadow-sm w-full max-w-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded bg-muted/10 ${step.role === 'OWNER' ? 'text-primary' : 'text-orange-500'}`}>
                          {step.role}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="absolute left-8 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-12 h-12 rounded-full bg-background border-4 border-surface shadow-sm flex items-center justify-center z-10 text-primary">
                    <step.icon className="w-5 h-5" />
                  </div>

                  {/* Right Side (Empty spacer for alternate layout) */}
                  <div className={`w-full md:w-[45%] hidden md:block ${isEven ? 'order-2' : 'order-1'}`}>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
