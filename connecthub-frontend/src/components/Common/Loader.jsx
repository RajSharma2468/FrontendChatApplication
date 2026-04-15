import React from 'react';

const Loader = () => {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100%', minHeight: '200px' }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-secondary">Loading...</p>
            </div>
        </div>
    );
};

export default Loader;