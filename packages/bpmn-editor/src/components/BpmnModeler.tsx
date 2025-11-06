import { cn } from "../lib/utils";
import BpmnJS from "bpmn-js/lib/Modeler";
import { useRef, useEffect, useState, useCallback } from "react";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "@bpmn-io/properties-panel/assets/properties-panel.css";
import diagramXML from "../resources/newDiagram";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import ZoomControls from "./ZoomControls";

import CamundaBpmnModdle from "camunda-bpmn-moddle/resources/camunda.json";
import BpmnControls from "./BpmnControls";
import { SaveSVGResult, SaveXMLResult } from "bpmn-js/lib/BaseViewer";

interface BpmnModelerProps {
  xml?: string;
  onChange?: (xml: string) => void;
  onLoad?: (modeler: BpmnJS) => void;
  processKey: string;
  processName: string;
  className?: string;
}

const BpmnModeler = ({
  xml,
  onChange,
  onLoad,
  processKey,
  processName,
  className,
}: BpmnModelerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnJS | null>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModelerReady, setIsModelerReady] = useState(false);

  // Track if this is internal change to avoid reloading
  const isInternalChangeRef = useRef(false);
  // Store initial XML to load only once
  const initialXmlRef = useRef<string | undefined>(xml);

  // Update initialXml when processKey changes (different diagram)
  useEffect(() => {
    initialXmlRef.current = xml;
  }, [xml, processKey]);

  useEffect(() => {
    if (!containerRef.current) return;

    let modeler: BpmnJS;

    try {
      modeler = new BpmnJS({
        container: containerRef.current,
        propertiesPanel: {
          parent: "#js-properties-panel",
        },
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
        ],
        moddleExtensions: {
          camunda: CamundaBpmnModdle,
        },
      });
    } catch (err) {
      console.error("Error creating BPMN modeler:", err);
      return;
    }

    modelerRef.current = modeler;

    // Wait for the modeler to be fully initialized
    const waitForModeler = () => {
      return new Promise<void>((resolve) => {
        const checkReady = () => {
          try {
            const canvas = modeler.get("canvas");
            // Check that canvas exists, has _layers, and _container is ready
            if (
              canvas &&
              (canvas as any)._layers &&
              (canvas as any)._container &&
              (canvas as any)._container.clientWidth > 0
            ) {
              resolve();
            } else {
              setTimeout(checkReady, 10);
            }
          } catch (err) {
            setTimeout(checkReady, 10);
          }
        };
        checkReady();
      });
    };

    // Safe zoom function with error handling
    const safeZoom = (canvas: any, mode: string | number) => {
      try {
        if (canvas && typeof canvas.zoom === "function") {
          canvas.zoom(mode);
        }
      } catch (err) {
        // Silently ignore zoom errors during initialization
      }
    };

    // Initialize the modeler with proper error handling
    const initializeModeler = async () => {
      try {
        // Wait for the modeler to be ready
        await waitForModeler();

        // Now it's safe to call onLoad
        onLoad?.(modeler);

        // Ensure the modeler is fully initialized before importing XML
        await new Promise((resolve) => setTimeout(resolve, 50));

        const canvas = modeler.get("canvas");

        // Use initial XML (only loads once during initialization)
        if (initialXmlRef.current) {
          // Use Promise API for importXML
          const result = await modeler.importXML(initialXmlRef.current);
          const { warnings } = result;
          if (warnings && warnings.length) {
            console.warn("Warnings during BPMN import:", warnings);
          }
          // Adjust zoom after import
          safeZoom(canvas, "fit-viewport");
        } else {
          await createNewDiagram(modeler, safeZoom);
        }

        // Setup change events after successful initialization
        modeler.on("commandStack.changed", async () => {
          try {
            // Mark as internal change to prevent reload
            isInternalChangeRef.current = true;

            const { xml: savedXml } = await modeler.saveXML({ format: true });
            // Ensure onChange is called only when xml is successfully retrieved
            if (savedXml) {
              onChange?.(savedXml);
            }

            // Reset internal change flag after a short delay
            setTimeout(() => {
              isInternalChangeRef.current = false;
            }, 100);
          } catch (err) {
            console.error("Failed to save BPMN XML:", err);
          }
        });

        // Mark modeler as ready after everything is initialized
        setIsModelerReady(true);
      } catch (err) {
        // Silently handle initialization errors - the modeler will still work
        // Don't mark as ready if initialization failed
      }
    };

    // Removed example snippet (debounce/setEncoded) not used in this app

    // Start initialization
    initializeModeler();

    return () => {
      setIsModelerReady(false);
      try {
        if (modelerRef.current) {
          (modelerRef.current as any).destroy();
          modelerRef.current = null;
        }
      } catch (err) {
        console.error("Error destroying BPMN modeler:", err);
      }
    };
    // Only reload when processKey or processName changes (different diagram)
    // onLoad, onChange, and xml are intentionally excluded to prevent unnecessary reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processKey, processName]);

  const createNewDiagram = async (
    modeler: BpmnJS,
    safeZoomFn?: (canvas: any, mode: string | number) => void,
  ) => {
    try {
      // Ensure the modeler is ready before creating a new diagram
      await new Promise((resolve) => setTimeout(resolve, 100));

      const xml = diagramXML(processKey, processName);
      const canvas = modeler.get("canvas");

      // Use Promise API for importXML
      const result = await modeler.importXML(xml);
      const { warnings } = result;
      if (warnings && warnings.length) {
        console.warn("Warnings during default diagram import:", warnings);
      }

      // Adjust zoom after import
      if (safeZoomFn) {
        safeZoomFn(canvas, "fit-viewport");
      } else {
        try {
          (canvas as any).zoom("fit-viewport");
        } catch (e) {
          // Ignore zoom errors
        }
      }

      // Notify the change
      onChange?.(xml);
    } catch (err) {
      // Silently handle errors - don't throw
    }
  };

  const togglePanel = () => {
    setIsPanelCollapsed((prev) => {
      const next = !prev;
      // Allow CSS transition to complete, then tell canvas to recalc size
      setTimeout(() => {
        try {
          const canvas = modelerRef.current?.get("canvas");
          if (canvas && typeof (canvas as any).resized === "function") {
            (canvas as any).resized();
          } else if (canvas && typeof (canvas as any).zoom === "function") {
            (canvas as any).zoom("fit-viewport");
          }
        } catch (e) {
          // no-op
        }
      }, 310);
      return next;
    });
  };

  const onUploadDiagram = async (xml: string) => {
    const canvas = modelerRef.current?.get("canvas");

    await modelerRef.current?.importXML(xml);
    (modelerRef.current?.get("canvas") as any).zoom("fit-viewport");

    (canvas as any).zoom("fit-viewport");

    // Notify the change
    onChange?.(xml);
  };

  const onDownLoadSvg = async (): Promise<SaveSVGResult | undefined> => {
    return await modelerRef.current?.saveSVG();
  };

  const onDownloadXml = async (): Promise<SaveXMLResult | undefined> => {
    return await modelerRef.current?.saveXML({ format: true });
  };

  const toggleFullscreen = useCallback(() => {
    if (!editorWrapperRef.current) return;

    if (!document.fullscreenElement) {
      editorWrapperRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          // Adjust canvas after entering fullscreen
          setTimeout(() => {
            try {
              const canvas = modelerRef.current?.get("canvas");
              if (canvas && typeof (canvas as any).zoom === "function") {
                (canvas as any).zoom("fit-viewport");
              }
            } catch (e) {
              // no-op
            }
          }, 100);
        })
        .catch((err) => {
          console.error("Error entering fullscreen:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          // Adjust canvas after exiting fullscreen
          setTimeout(() => {
            try {
              const canvas = modelerRef.current?.get("canvas");
              if (canvas && typeof (canvas as any).zoom === "function") {
                (canvas as any).zoom("fit-viewport");
              }
            } catch (e) {
              // no-op
            }
          }, 100);
        })
        .catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
    }
  }, []);

  // Listen for fullscreen changes (e.g., when user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Adjust canvas when fullscreen state changes
      setTimeout(() => {
        try {
          const canvas = modelerRef.current?.get("canvas");
          if (canvas && typeof (canvas as any).zoom === "function") {
            (canvas as any).zoom("fit-viewport");
          }
        } catch (e) {
          // no-op
        }
      }, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={editorWrapperRef}
      className={cn(
        "flex relative border rounded-lg bg-white",
        isFullscreen ? "h-screen" : "h-[78vh]",
        className,
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          "flex-1 w-full h-full transition-all duration-300 ease-in-out",
          "bg-[radial-gradient(circle_at_0.5px_0.5px,rgba(0,0,0,0.2)_0.5px,transparent_0)]",
          "bg-[length:10px_10px]",
          "relative",
        )}
      >
        {/* BPMN Controls */}
        {isModelerReady && modelerRef.current && (
          <div className="absolute top-4 right-4 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <BpmnControls
              modeler={modelerRef.current}
              processKey={processKey}
              processName={processName}
              onTogglePanel={togglePanel}
              isPanelCollapsed={isPanelCollapsed}
              onUploadDiagram={onUploadDiagram}
              onDownLoadSvg={onDownLoadSvg}
              onDownloadXml={onDownloadXml}
            />
          </div>
        )}

        {/* Zoom Controls */}
        {isModelerReady && modelerRef.current && (
          <div className="absolute bottom-12 right-4 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <ZoomControls
              modeler={modelerRef.current}
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
            />
          </div>
        )}
      </div>
      <div
        id="js-properties-panel"
        className={cn(
          "h-full overflow-y-auto transition-all duration-300 ease-in-out",
          isPanelCollapsed ? "w-0" : "w-80 border-l",
        )}
      />
    </div>
  );
};

export { BpmnModeler };
