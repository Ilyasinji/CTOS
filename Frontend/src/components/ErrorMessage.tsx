interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 p-4 rounded-md">
      <p className="text-red-800">{message}</p>
    </div>
  );
}