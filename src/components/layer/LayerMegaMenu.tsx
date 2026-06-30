import { Link, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="gap-1">
        {PUBLIC_LAYERS.map((layer) => {
          const meta = LAYER_META[layer];
          const items = nodesByLayer(layer, { includeAlsoIn: true });
          const isActiveLayer = items.some((n) => pathname === n.path) || pathname === meta.hubPath;
          return (
            <NavigationMenuItem key={layer}>
              <NavigationMenuTrigger
                className={[
                  "relative bg-transparent uppercase tracking-[0.18em] text-[11.5px] lg:text-[12px] font-medium h-9 px-3.5 rounded-full",
                  "transition-all duration-300 ease-out",
                  "hover:bg-[#2a0f14]/60 data-[state=open]:bg-[#2a0f14]/70 data-[state=open]:text-white",
                  "after:pointer-events-none after:absolute after:left-3.5 after:right-3.5 after:bottom-1 after:h-px after:bg-[#e25a5a]",
                  "after:origin-center after:scale-x-0 after:transition-transform after:duration-300",
                  "hover:after:scale-x-100 data-[state=open]:after:scale-x-100",
                  isActiveLayer
                    ? "text-white after:scale-x-100"
                    : "text-[#f0c9c9]/80 hover:text-white",
                ].join(" ")}
              >
                {meta.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[min(92vw,560px)] p-4 bg-[#08080d]/95 backdrop-blur-2xl border border-[#7a1e1e]/55 rounded-2xl shadow-[0_24px_60px_-20px_rgba(200,60,60,0.45)]">
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#e25a5a]/80 font-medium">
                      The {meta.label}
                    </span>
                    <span className="text-[11px] text-[#f0c9c9]/55">{meta.tagline}</span>
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {items.map((node) => {
                      const isActive = pathname === node.path;
                      const LinkTag: any = node.external ? "a" : Link;
                      const linkProps = node.external
                        ? { href: node.path, target: "_blank", rel: "noopener noreferrer" }
                        : { to: node.path };
                      return (
                        <li key={`${layer}-${node.path}`}>
                          <LinkTag
                            {...linkProps}
                            aria-current={isActive ? "page" : undefined}
                            className={[
                              "group block rounded-lg px-3 py-2.5 transition-all duration-300 ease-out",
                              "hover:bg-[#2a0f14]/60 hover:translate-x-0.5",
                              isActive
                                ? "bg-[#3a1418]/70 ring-1 ring-[#e25a5a]/40"
                                : "",
                            ].join(" ")}
                          >
                            <span className={`block text-[13.5px] transition-colors ${isActive ? "text-white" : "text-[#f0c9c9]/90 group-hover:text-white"}`}>
                              {node.title}
                              {node.external && (
                                <span className="ml-1.5 text-[9.5px] uppercase tracking-[0.18em] text-[#e25a5a]/80 align-middle">↗</span>
                              )}
                            </span>
                            {node.blurb && (
                              <span className="block text-[11.5px] text-[#f0c9c9]/50 mt-0.5">
                                {node.blurb}
                              </span>
                            )}
                          </LinkTag>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-[#7a1e1e]/45">
                    <Link
                      to={meta.hubPath}
                      className="text-[11.5px] uppercase tracking-[0.16em] text-[#e25a5a]/85 hover:text-white transition-colors"
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