export default function PageHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}