export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h1 className="text-xl font-medium tracking-tight text-charcoal">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-fog">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
