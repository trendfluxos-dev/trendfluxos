import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LAYER_META, nodesByLayer, type Layer } from "@/config/siteLayers";

const PUBLIC_LAYERS: Layer[] = ["company", "founder", "brand"];

/**
 * Desktop mega-menu. One hover-triggered dropdown per public layer
 * (Company / Founder / Brands). Items come from the central layer map.
 */
const LayerMegaMenu = () => {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="gap-1">
        {PUBLIC_LAYERS.map((layer) => {
          const meta = LAYER_META[layer];
          const items = nodesByLayer(layer, { includeAlsoIn: true });
          return (
            <NavigationMenuItem key={layer}>
              <NavigationMenuTrigger className="bg-transparent text-foreground/65 hover:text-foreground hover:bg-transparent data-[state=open]:bg-transparent text-[12px] lg:text-[13px] font-normal h-9 px-3">
                {meta.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[min(92vw,560px)] p-4">
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="text-[10.5px] uppercase tracking-[0.22em] text-foreground/45 font-medium">
                      The {meta.label}
                    </span>
                    <span className="text-[11px] text-foreground/55">{meta.tagline}</span>
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {items.map((node) => (
                      <li key={`${layer}-${node.path}`}>
                        <Link
                          to={node.path}
                          className="block rounded-lg px-3 py-2.5 hover:bg-muted/70 transition-colors group"
                        >
                          <span className="block text-[13.5px] text-foreground/90 group-hover:text-foreground">
                            {node.title}
                          </span>
                          {node.blurb && (
                            <span className="block text-[11.5px] text-foreground/50 mt-0.5">
                              {node.blurb}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <Link
                      to={meta.hubPath}
                      className="text-[12px] text-foreground/70 hover:text-foreground transition-colors"
                    >
                      View {meta.label} hub →
                    </Link>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default LayerMegaMenu;