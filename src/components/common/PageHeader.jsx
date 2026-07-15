export default function PageHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-zinc-900">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}