"use client";
import React from "react";
import { motion } from "framer-motion";
import { Brain, Rocket, Users, Sparkles } from "lucide-react";

export function About() {
  return (
    <section className="h-full min-h-screen flex items-center justify-center relative py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* 左侧：文字叙述 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-primary font-bold tracking-widest uppercase text-base mb-4">
              关于我
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-8 leading-[1.1]">
              不止于分析，<br/>更致力于<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">价值创造</span>。
            </h3>
            <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed mb-8">
              作为一名充满激情的数据分析师，我不仅仅关注代码和算法，更看重数据背后的业务逻辑。我擅长将复杂的原始数据转化为清晰、可执行的商业洞察。
            </p>
            <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed">
              无论是构建预测模型来降低客户流失，还是通过自动化仪表盘提升决策效率，我的目标始终如一：<span className="font-bold text-indigo-600 bg-indigo-50 px-2 rounded-lg">用数据的力量驱动业务增长</span> 。
            </p>
          </motion.div>

          {/* 右侧：特征卡片矩阵 (2x2 Staggered Grid) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-6"
          >
            {/* Column 1 */}
            <div className="space-y-6">
                <div className="bg-card/80 backdrop-blur-sm p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group aspect-[4/3] flex flex-col justify-center">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <Brain className="w-7 h-7 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-blue-600 transition-colors">深度洞察</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">挖掘数据深层模式，发现被忽视的增长机会。</p>
                </div>

                <div className="bg-card/80 backdrop-blur-sm p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group aspect-[4/3] flex flex-col justify-center">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <Users className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-emerald-600 transition-colors">商业伙伴</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">用通俗易懂的语言与业务团队沟通，弥合技术鸿沟。</p>
                </div>
            </div>

            {/* Column 2 (Shifted Down) */}
            <div className="space-y-6 mt-16 md:mt-24">
                <div className="bg-card/80 backdrop-blur-sm p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group aspect-[4/3] flex flex-col justify-center">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <Rocket className="w-7 h-7 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-purple-600 transition-colors">效率提升</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">自动化繁琐流程，让团队专注于高价值工作。</p>
                </div>

                <div className="bg-card/80 backdrop-blur-sm p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group aspect-[4/3] flex flex-col justify-center">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                    <Sparkles className="w-7 h-7 text-amber-600" />
                </div>
                <h4 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-amber-600 transition-colors">持续进化</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">保持对新技术的好奇心，不断拓展能力边界。</p>
                </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
