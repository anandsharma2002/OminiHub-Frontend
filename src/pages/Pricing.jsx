import React, { useState } from 'react';
import Footer from '../components/layout/Footer';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: 'Starter',
            description: 'Perfect for individuals and hobbyists.',
            price: isAnnual ? 0 : 0,
            features: [
                'Unlimited Public Projects',
                'Kanban Boards',
                'Standard Community Support',
                'Project Documentation',
                'Basic Chat Features'
            ],
            notIncluded: [
                'Private Projects',
                'AI Assistant Access',
                'Priority Support'
            ],
            cta: 'Start for Free',
            highlight: false
        },
        {
            name: 'Pro',
            description: 'For growing teams and serious developers.',
            price: isAnnual ? 12 : 15,
            features: [
                'Everything in Starter',
                'Unlimited Private Projects',
                'AI-Powered Assistant',
                'Advanced Search',
                'Priority Email Support',
                'Team Collaboration Tools'
            ],
            notIncluded: [
                'Dedicated Account Manager',
                'Custom Integrations'
            ],
            cta: 'Get Started',
            highlight: true
        },
        {
            name: 'Enterprise',
            description: 'Scalable solutions for large organizations.',
            price: isAnnual ? 49 : 59,
            features: [
                'Everything in Pro',
                'Unlimited Storage',
                'Dedicated Account Manager',
                '24/7 Phone Support',
                'Custom Onboarding',
                'SLA Guarantees'
            ],
            notIncluded: [],
            cta: 'Contact Sales',
            highlight: false
        }
    ];

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#020617]">
            <main className="flex-grow">
                {/* Header */}
                <section className="py-20 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] -z-10"></div>

                    <div className="page-container relative z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">
                            Simple, transparent <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-500">pricing</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
                            Choose the plan that's right for you. Change or cancel anytime.
                        </p>

                        {/* Toggle */}
                        <div className="flex items-center justify-center space-x-4 mb-12">
                            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 bg-violet-600"
                            >
                                <span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                Yearly <span className="text-emerald-500 text-xs font-bold ml-1">(Save 20%)</span>
                            </span>
                        </div>
                    </div>
                </section>

                {/* Cards */}
                <section className="pb-24">
                    <div className="page-container">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {plans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`relative rounded-2xl p-8 transition-all duration-300 ${plan.highlight
                                        ? 'bg-white dark:bg-slate-900 border-2 border-violet-500 shadow-xl shadow-violet-500/20 scale-105 z-10'
                                        : 'bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl hover:border-violet-300 dark:hover:border-violet-700'
                                        }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            Most Popular
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10">{plan.description}</p>

                                    <div className="flex items-baseline mb-8">
                                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${plan.price}</span>
                                        <span className="text-slate-500 dark:text-slate-400 ml-2">/month</span>
                                    </div>

                                    <Link
                                        to="/signup"
                                        className={`block w-full text-center py-3 rounded-xl font-medium transition-all ${plan.highlight
                                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/30'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Link>

                                    <div className="mt-8 space-y-4">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                                                <FaCheck className="text-emerald-500 mr-3 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                        {plan.notIncluded.map((feature, i) => (
                                            <div key={i} className="flex items-center text-sm text-slate-400 dark:text-slate-600">
                                                <FaTimes className="mr-3 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Pricing;
