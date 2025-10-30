import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('firstName')} />
      <input {...register('lastName')} />
      <button type="submit">Submit</button>
    </form>
  );
}

import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('email', { required: true })} />
      {errors.email && <span>Email is required</span>}
      <button type="submit">Submit</button>
    </form>
  );
}

import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>This field is required</span>}
    </form>
  );
}

import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => console.log(data);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('field')} />
      <button type="submit">Submit</button>
    </form>
  );
}

import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, watch } = useForm();
  const watchedValue = watch('firstName');
  return (
    <form>
      <input {...register('firstName')} />
      <p>Watched: {watchedValue}</p>
    </form>
  );
}

import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = data => {
    console.log(data);
    reset();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      <button type="submit">Submit</button>
    </form>
  );
}

import { useForm } from 'react-hook-form';
function MyForm() {
  const { register, handleSubmit } = useForm({
    defaultValues: { firstName: 'John', lastName: 'Doe' }
  });
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('firstName')} />
      <input {...register('lastName')} />
      <button type="submit">Submit</button>
    </form>
  );
}