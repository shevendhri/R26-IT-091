"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Modal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '2rem'
        }} onClick={onClose}>
            <div
                className="glass-panel glow-border"
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '85vh',
                    padding: '3rem',
                    position: 'relative',
                    overflowY: 'auto',
                    backgroundColor: 'var(--eco-deep)',
                    border: '1px solid var(--eco-glow-soft)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        transition: 'color 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.color = 'var(--eco-glow)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                    ✕
                </button>

                <h2 style={{
                    fontFamily: 'Space Grotesk',
                    fontSize: '2rem',
                    color: 'var(--eco-glow)',
                    marginBottom: '2rem',
                    borderBottom: '1px solid var(--glass-border)',
                    paddingBottom: '1rem'
                }}>
                    {title}
                </h2>

                <div style={{
                    color: 'var(--text-primary)',
                    lineHeight: '1.8',
                    fontSize: '1rem',
                    whiteSpace: 'pre-wrap'
                }}>
                    {content}
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn-premium"
                        onClick={onClose}
                        style={{ padding: '0.8rem 2rem', fontSize: '0.8rem' }}
                    >
                        UNDERSTOOD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PlanAnalyzer() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    const modalContents = {
        act: {
            title: "Act No 4 of 1978",
            content: `Instructions for submitting building plans as per Urban Development Act No. 41 of 1978

1. i The proposed construction plan/plan should be submitted in 3 copies.
iI All plans submitted should be prepared by an architect/planner and should bear the name and address. They should be signed.
iii The owner of the land or site should be signed.
iv The Authority may require the submission of such additional details and plans as the Authority may deem necessary.
v A copy of the plot plan prepared by an authorized surveyor on a scale not less than 1:1000 should be submitted with the building application.
vi All plans should clearly and accurately show the new building work and all parts and proposals of any existing building in colour or composition.`
        },
        special: {
            title: "Special Actions",
            content: `Special attention should be paid to the following requirements when preparing building plans.

2. i To be in scale (8 - 0 0 -1*00031: 100) Foundation details 2' - 0*1* or 120
ii North direction should be indicated correctly.
iii Building plan, house plan should consist of front view, side view, cross-section, foundation and field plan. In cases where the complexity of the building increases, several cross-sections should be shown according to that nature.
iv The method of accessing the relevant land should be indicated. (Name and width of the main road)
v The method of establishing the building on the relevant land and the nearest distance from the boundaries to the building should be clearly indicated.
vi The toilets and well / tube well should be clearly indicated. (The distance should not be less than 60 feet.) The distance between the proposed wells and pit latrines and the well should be 60* - 0' from the well.

3. i The floor plan - front view, cross section, length - width of windows and doors should contain the square footage of the building.
ii Every room in a building should be provided with natural light and ventilation through windows and doors or other approved windows.
iii The use and length and width of the various parts of the rooms in the building should be indicated.
iv The location of all doors, windows and windows should be indicated.
v The height of each roof overhang should be indicated.
vi The thickness of the walls - roof - foundation slabs should be indicated.

4. i The distance from the building to the overhead electric wires shall be indicated.
ii Methods of discharging rainwater.
iii Every building intended for human habitation shall have a toilet. Such toilet shall be indicated in the plan. Otherwise, the construction of the building shall not be permitted.

5. i No permanent or temporary building shall be constructed or altered or any parking space shall be marked within the limits of the building.
ii The minimum number of parking spaces shall be indicated in the plan submitted in accordance with the standards of the Land Development Authority. In cases where the Urban Development Authority is of the opinion that the owner is unable to provide the required number of parking spaces, a service charge shall be paid in respect of each parking space not provided.

6. i No building, existing or proposed to be constructed, shall be used for any purpose other than that approved by the Authority.
ii Building plans shall be prepared in accordance with the planning and building regulations of the Urban Development Authority.`
        },
        gazette: {
            title: "No 223/54 - July 2021",
            content: `For more details, see the Extraordinary Gazette of the Democratic Socialist Republic of Sri Lanka No. 2235/54 and the Gazette Extraordinary dated 08 July 2021.

Warning.

1. Do not construct permanent or temporary buildings or carry out any construction-related activities without obtaining a permit. Doing so will be considered as unauthorized construction and action will be taken as per the law. You will have to pay fines only if an unauthorized construction can be legalized.

2. It is prohibited to occupy or use any building without obtaining a certificate of conformity. Those who do so will have to pay a fine of Rs. 100/- per day.

3. The validity period of the approval for the construction of the building is limited to one year and the validity period must be extended before the expiry of that period.

4. It is illegal to construct/reconstruct/alter/change the approved plan of a building without the approval of this Pradeshiya Sabha. If it is necessary to construct the building differently from the approved plan, a revised plan must be submitted without delay. The construction of the building should not be started until the said revised plan is approved by the Chairman.`
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--eco-black)', color: '#fff', position: 'relative' }}>
            <div className="premium-bg">
                <div className="gradient-mesh"></div>
                <div className="blueprint-grid"></div>
            </div>

            <Header />

            <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                {/* Header Section */}
                <div style={{ marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '1.5rem', color: 'var(--eco-glow)', fontFamily: 'Space Grotesk', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Plan Analyzer
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
                        AI-based Building Plan Compliance Checking
                    </p>
                </div>

                {/* Main Title Section */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Obtaining a Permit to Construct a Building
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                        More Information
                    </p>
                </div>

                {/* Info Buttons Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
                    <button
                        className="glass-panel glow-border"
                        onClick={() => setActiveModal('act')}
                        style={{
                            padding: '1.25rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255, 255, 255, 0.02)'
                        }}
                    >
                        Act No 4 of 1978
                    </button>
                    <button
                        className="glass-panel glow-border"
                        onClick={() => setActiveModal('special')}
                        style={{
                            padding: '1.25rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255, 255, 255, 0.02)'
                        }}
                    >
                        Special Actions
                    </button>
                    <button
                        className="glass-panel glow-border"
                        onClick={() => setActiveModal('gazette')}
                        style={{
                            padding: '1.25rem',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(255, 255, 255, 0.02)'
                        }}
                    >
                        No 223/54 - July 2021
                    </button>
                </div>

                {/* Upload Section */}
                <div className="glass-panel" style={{
                    padding: '2.5rem',
                    border: '1px solid var(--eco-glow-soft)',
                    borderRadius: '12px',
                    background: 'rgba(13, 43, 33, 0.2)'
                }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontFamily: 'Space Grotesk', fontWeight: 700 }}>Upload Plan</h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>
                            Selected File Name
                        </label>
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '1.25rem',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            color: selectedFile ? '#fff' : 'var(--text-dim)',
                            fontSize: '0.9rem'
                        }}>
                            {selectedFile ? selectedFile.name : "No file selected yet"}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
                        <input
                            type="file"
                            id="plan-upload"
                            hidden
                            onChange={handleFileChange}
                            accept=".pdf,.png,.jpg,.jpeg,.dwg"
                        />
                        <label
                            htmlFor="plan-upload"
                            style={{
                                width: 'fit-content',
                                padding: '0.75rem 2rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                backgroundColor: 'var(--eco-glow)',
                                color: 'var(--eco-black)',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontFamily: 'Space Grotesk',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                            onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
                        >
                            Choose Plan File
                        </label>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 500 }}>
                            Click the button to select the building plan from your computer.
                        </p>
                    </div>

                    <button
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: 'var(--eco-glow)',
                            color: 'var(--eco-black)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: selectedFile ? 'pointer' : 'not-allowed',
                            opacity: selectedFile ? 1 : 0.6,
                            transition: 'all 0.3s ease',
                            fontFamily: 'Space Grotesk'
                        }}
                        disabled={!selectedFile}
                        onMouseEnter={e => selectedFile && (e.target.style.filter = 'brightness(1.1)')}
                        onMouseLeave={e => selectedFile && (e.target.style.filter = 'brightness(1)')}
                    >
                        Analyze Plan
                    </button>
                </div>
            </main>

            <Footer />

            {/* Modals */}
            {activeModal && (
                <Modal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    title={modalContents[activeModal].title}
                    content={modalContents[activeModal].content}
                />
            )}
        </div>
    );
}