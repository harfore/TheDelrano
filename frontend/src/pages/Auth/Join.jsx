// multi-step registration form with validation and progress tracking
// handles user registration with email, password, username, and country selection

// Features:
// - Multi-step form navigation with validation at each step
// - Yup schema validation for all form fields
// - Dynamic country dropdown populated from API
// - Progress stepper visualization
// - Error handling and submission states
// - Automatic token storage upon successful registration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import fetchCountries from '../../services/api/FetchCountries';
import registerUser from '../../services/api/RegisterUser';
import FormInput from "../../components/Auth/FormInput";
import '../../styles/JoinLogin.css';

const Join = () => {
    const schema = yup.object().shape({
        // form validation schema using yup
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        username: yup.string().min(3, 'Username must be at least 3 characters').max(22, 'Max 22 characters').required(),
        country: yup.string().required('Please select a country'),
    });

    // react Hook Form configuration
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
        setValue, // getting current field values
        watch      // watching field changes
    } = useForm({
        resolver: yupResolver(schema),
    });

    const steps = [
        { label: '1', description: 'Please enter your email.', field: 'email' },
        { label: '2', description: 'Pick a password.', field: 'password' },
        { label: '3', description: 'Pick a username.', field: 'username' },
        { label: '4', description: 'Pick your country.', field: 'country' },
        { label: '5', description: 'Review your information and confirm.' },
    ];

    // component state
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        country: ''
    });
    const [countries, setCountries] = useState([]);
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // fetch countries on component mount
    useEffect(() => {
        fetchCountries().then(setCountries);
    }, []);

    // handles navigation to the next form step with validation
    const handleNext = () => {
        const currentField = steps[activeStep].field;

        try {
            schema.validateSyncAt(currentField, formData);
            clearErrors(currentField);
            setActiveStep(prev => prev + 1);
        } catch (error) {
            setError(currentField, {
                type: 'manual',
                message: error.message
            });
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // updates form data and react-hook-form value on input change
    // @param {Object} e - the change event object
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValue(name, value);
    };

    // handles form submission with validation and API call
    // @param {Object} formData - The complete form data
    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        setSubmitError(null); // Reset error state

        try {
            await schema.validate(formData, { abortEarly: false });
            const result = await registerUser(formData);

            if (result.token) {
                localStorage.setItem('token', result.token);
                navigate('/');
            } else {
                setSubmitError(result.message || 'Registration failed');
            }
        } catch (error) {
            if (error.inner) {
                error.inner.forEach(err => {
                    setError(err.path, {
                        type: 'manual',
                        message: err.message
                    });
                });
            } else {
                setSubmitError(error.message || 'An error occurred during registration');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='page'>
            <h1 className='page-headline'>Enter The Delrano!</h1>
            <div className="stepper-container">
                <div className="stepper-header">
                    {steps.map((step, index) => (
                        <div key={step.label} className={`step ${index === activeStep ? 'active' : ''}`}>
                            {step.label}
                        </div>
                    ))}
                </div>

                <div className="stepper-content">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (activeStep < steps.length - 1) {
                            handleNext();
                        } else {
                            handleSubmit(onSubmit)();
                        }
                    }}>
                        <div className="step-description">
                            <p>{steps[activeStep].description}</p>
                        </div>

                        {activeStep === 0 && (
                            <FormInput
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                register={register}
                                error={errors.email?.message}
                                placeholder="Email"
                                autoFocus
                            />
                        )}

                        {activeStep === 1 && (
                            <FormInput
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                register={register}
                                error={errors.password?.message}
                                placeholder="Password"
                                autoFocus
                            />
                        )}

                        {activeStep === 2 && (
                            <FormInput
                                label="Username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                register={register}
                                error={errors.username?.message}
                                placeholder="Username"
                                autoFocus
                            />
                        )}

                        {activeStep === 3 && (
                            <div className="form-group">
                                <label>Country</label>
                                <select
                                    {...register("country")}  // proper RHF registration
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="account_field"
                                >
                                    <option value="">Select a country</option>
                                    {countries.map((country) => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                                {errors.country && <p className="error">{errors.country.message}</p>}
                            </div>
                        )}

                        {activeStep === 4 && (
                            <div className="review-section">
                                <h3>Review Your Information</h3>
                                <p>Email: {formData.email}</p>
                                <p>Username: {formData.username}</p>
                                <p>Country: {formData.country}</p>
                            </div>
                        )}

                        {submitError && (
                            <div className="error-message">
                                {submitError}
                            </div>
                        )}

                        <div className="stepper-actions">
                            {activeStep !== 0 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={isSubmitting}
                                >
                                    Back
                                </button>
                            )}

                            {activeStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="account_field"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Join;