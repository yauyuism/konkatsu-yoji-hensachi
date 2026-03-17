import { getToolById, isToolNew, type ToolId } from "@/data/tools";
import { ToolCard } from "@/components/ToolCard";

type CrossPromotionProps = {
  toolId?: ToolId;
  href?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string | null;
  className?: string;
};

export function CrossPromotion({
  toolId,
  href,
  eyebrow,
  title,
  description,
  ctaLabel = "詳しく見る",
  className = "",
}: CrossPromotionProps) {
  const tool = toolId ? getToolById(toolId) : undefined;
  const resolvedHref = href ?? tool?.path;
  const resolvedEyebrow = eyebrow ?? tool?.label;
  const resolvedTitle = title ?? tool?.name;
  const resolvedDescription = description ?? tool?.promoDescription ?? tool?.description;

  if (!resolvedHref || !resolvedEyebrow || !resolvedTitle || !resolvedDescription) {
    return null;
  }

  return (
    <ToolCard
      label={resolvedEyebrow}
      title={resolvedTitle}
      description={resolvedDescription}
      tags={tool?.tags}
      href={resolvedHref}
      isNew={tool ? isToolNew(tool) : false}
      ctaLabel={ctaLabel ?? undefined}
      className={className}
    />
  );
}
