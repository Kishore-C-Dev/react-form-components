import { useState } from 'react';
import { z } from 'zod';
import { useFormWithZod } from '@/hooks/useFormWithZod';
import {
  TextInput,
  TextArea,
  Select,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Toggle,
  FileInput,
  RangeSlider,
  FormSection,
  FormActions,
} from '@/components/form';
import { Button, Badge } from '@/components/ui';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  birthDate: z.string().min(1, 'Date of birth is required'),
  bio: z.string().max(300, 'Max 300 characters').optional(),
  country: z.string().min(1, 'Please select a country'),
  gender: z.string().min(1, 'Please select a gender'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  newsletter: z.boolean().optional(),
  notifications: z.boolean().optional(),
  experience: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const countryOptions = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'India', value: 'in' },
  { label: 'Canada', value: 'ca' },
  { label: 'Australia', value: 'au' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'nonbinary' },
  { label: 'Prefer not to say', value: 'undisclosed' },
];

const interestOptions = [
  { label: 'Technology', value: 'tech' },
  { label: 'Design', value: 'design' },
  { label: 'Business', value: 'business' },
  { label: 'Science', value: 'science' },
];

const experienceOptions = [
  { label: '0 – 1 year', value: '0-1', hint: 'Entry level' },
  { label: '2 – 5 years', value: '2-5', hint: 'Mid level' },
  { label: '6 – 10 years', value: '6-10', hint: 'Senior level' },
  { label: '10+ years', value: '10+', hint: 'Principal / Staff' },
];

export function FormDemo() {
  const [submitted, setSubmitted] = useState<FormData | null>(null);
  const [salary, setSalary] = useState(50);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useFormWithZod<FormData>({
    schema,
    defaultValues: { interests: [], newsletter: false, notifications: true },
  });

  const bio = watch('bio') ?? '';

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">React Form Components</h1>
        <p className="mt-1 text-sm text-gray-500">
          Full showcase — all reusable components with Zod validation.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => setSubmitted(d))} noValidate className="space-y-8">
        <FormSection title="Personal Information" columns={2}>
          <TextInput
            label="First Name"
            required
            registration={register('firstName')}
            error={errors.firstName?.message}
            placeholder="John"
          />
          <TextInput
            label="Last Name"
            required
            registration={register('lastName')}
            error={errors.lastName?.message}
            placeholder="Doe"
          />
          <TextInput
            type="email"
            label="Email"
            required
            registration={register('email')}
            error={errors.email?.message}
            placeholder="john@example.com"
          />
          <TextInput
            type="tel"
            label="Phone"
            registration={register('phone')}
            error={errors.phone?.message}
            placeholder="+1 555 000 0000"
            leftAddon="+1"
          />
          <TextInput
            type="url"
            label="Website"
            registration={register('website')}
            error={errors.website?.message}
            placeholder="https://example.com"
            hint="Optional personal or portfolio URL"
          />
          <TextInput
            type="date"
            label="Date of Birth"
            required
            registration={register('birthDate')}
            error={errors.birthDate?.message}
          />
        </FormSection>

        <FormSection title="About You">
          <TextArea
            label="Bio"
            registration={register('bio')}
            error={errors.bio?.message}
            placeholder="Tell us a little about yourself…"
            rows={4}
            showCharCount
            maxLength={300}
            currentLength={bio.length}
          />
        </FormSection>

        <FormSection title="Location & Demographics" columns={2}>
          <Select
            label="Country"
            required
            options={countryOptions}
            placeholder="Select a country"
            registration={register('country')}
            error={errors.country?.message}
          />
          <RadioGroup
            label="Gender"
            required
            options={genderOptions}
            registration={register('gender')}
            error={errors.gender?.message}
            orientation="vertical"
          />
        </FormSection>

        <FormSection title="Experience">
          <RadioGroup
            label="Years of Experience"
            options={experienceOptions}
            registration={register('experience')}
            orientation="horizontal"
          />
        </FormSection>

        <FormSection title="Interests">
          <CheckboxGroup
            label="Select your interests"
            required
            options={interestOptions}
            registration={register('interests')}
            error={errors.interests?.message}
            orientation="horizontal"
          />
        </FormSection>

        <FormSection title="Expected Salary">
          <RangeSlider
            label="Annual Salary Expectation"
            min={30}
            max={200}
            step={5}
            unit="k"
            showValue
            currentValue={salary}
            onChange={(e) => setSalary(Number(e.currentTarget.value))}
            hint="Drag to set your expected annual salary in USD"
          />
        </FormSection>

        <FormSection title="Resume / CV">
          <FileInput
            label="Upload Resume"
            hint="PDF or DOCX, max 5 MB"
            accept=".pdf,.docx"
            dragDrop
          />
        </FormSection>

        <FormSection title="Preferences">
          <Checkbox
            label="Subscribe to newsletter"
            registration={register('newsletter')}
          />
          <Toggle
            label="Push Notifications"
            description="Receive real-time alerts for messages and updates"
            registration={register('notifications')}
          />
        </FormSection>

        <FormActions>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Submit
          </Button>
        </FormActions>
      </form>

      {submitted && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="success" dot>
              Form submitted
            </Badge>
          </div>
          <pre className="overflow-auto text-xs text-gray-700">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
