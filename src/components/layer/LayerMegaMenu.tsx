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
                  "hover:bg-[#fbeaea] dark:hover:bg-[#2a0f14]/60 data-[state=open]:bg-[#fbeaea] dark:data-[state=open]:bg-[#2a0f14]/70 data-[state=open]:text-[#1a0a0a] dark:data-[state=open]:text-white",
                  "after:pointer-events-none after:absolute after:left-3.5 after:right-3.5 after:bottom-1 after:h-px after:bg-[#e25a5a]",
                  "after:origin-center after:scale-x-0 after:transition-transform after:duration-300",
                  "hover:after:scale-x-100 data-[state=open]:after:scale-x-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e25a5a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#08080d] focus-visible:after:scale-x-100",
                  isActiveLayer
                    ? "text-[#1a0a0a] dark:text-white after:scale-x-100"
                    : "text-[#3a0d10] dark:text-[#f0c9c9]/80 hover:text-[#1a0a0a] dark:hover:text-white",
                ].join(" ")}
              >
                {meta.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[min(92vw,560px)] p-4 bg-white/95 dark:bg-[#08080d]/95 backdrop-blur-2xl border border-[#c11f1f]/25 dark:border-[#7a1e1e]/55 rounded-2xl shadow-[0_24px_60px_-20px_rgba(120,20,20,0.25)] dark:shadow-[0_24px_60px_-20px_rgba(200,60,60,0.45)]">
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <span className="text-[10.5px] uppercase tracking-[0.24em] text-[#9a1818] dark:text-[#e25a5a]/80 font-medium">
                      The {meta.label}
                    </span>
                    <span className="text-[11px] text-[#3a0d10]/65 dark:text-[#f0c9c9]/55">{meta.tagline}</span>
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
                              "group relative block rounded-lg px-3 py-2.5 pl-4 transition-all duration-300 ease-out",
                              "hover:bg-[#fbeaea] dark:hover:bg-[#2a0f14]/60 hover:translate-x-0.5",
                            "focus:outline-none focus-visible:bg-[#fbeaea] dark:focus-visible:bg-[#2a0f14]/70 focus-visible:translate-x-0.5 focus-visible:ring-2 focus-visible:ring-[#e25a5a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#08080d]",
                              isActive
                                ? "bg-[#fbeaea] dark:bg-[#3a1418]/80 ring-1 ring-[#c11f1f]/50 dark:ring-[#e25a5a]/50 shadow-[inset_3px_0_0_0_#c11f1f] dark:shadow-[inset_3px_0_0_0_#e25a5a]"
                                : "",
                            ].join(" ")}
                          >
                            <span className={`flex items-center gap-2 text-[13.5px] transition-colors ${isActive ? "text-[#1a0a0a] dark:text-white font-medium" : "text-[#3a0d10] dark:text-[#f0c9c9]/90 group-hover:text-[#1a0a0a] dark:group-hover:text-white"}`}>
                              {node.title}
                              {node.external && (
                                <span className="ml-1.5 text-[9.5px] uppercase tracking-[0.18em] text-[#9a1818] dark:text-[#e25a5a]/80 align-middle">↗</span>
                              )}
                              {isActive && (
                                <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-[#c11f1f] dark:text-[#e25a5a] font-semibold">Current</span>
                              )}
                            </span>
                            {node.blurb && (
                              <span className="block text-[11.5px] text-[#3a0d10]/65 dark:text-[#f0c9c9]/50 mt-0.5">
                                {node.blurb}
                              </span>
                            )}
                          </LinkTag>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-[#c11f1f]/25 dark:border-[#7a1e1e]/45">
                    <Link
                      to={meta.hubPath}
                      className="inline-block rounded-md text-[11.5px] uppercase tracking-[0.16em] text-[#9a1818] dark:text-[#e25a5a]/85 hover:text-[#1a0a0a] dark:hover:text-white transition-colors focus:outline-none focus-visible:text-[#1a0a0a] dark:focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[#e25a5a]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#08080d]"
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