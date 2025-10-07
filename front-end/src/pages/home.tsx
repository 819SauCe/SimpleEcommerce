import Button  from '../components/Button';

export function Home() {
  return (
    <>
    <h1>home</h1>
    <Button label="Click me" onClick={() => alert('Button clicked!')} className='default_button'/>
    </>
  );
}