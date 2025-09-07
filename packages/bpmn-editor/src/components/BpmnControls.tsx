import React, { useCallback, useRef, useState } from "react";
import {
  downloadFile,
  generateFilename,
  showError,
  showSuccess,
} from "./utils/bpmnUtils";
import {
  IGRPButton,
  IGRPSeparator,
  IGRPToastProps,
  useIGRPToast,
} from "@igrp/igrp-framework-react-design-system";
import { SaveSVGResult, SaveXMLResult } from "bpmn-js/lib/BaseViewer";

interface BpmnControlsProps {
  modeler: any;
  processKey: string;
  processName: string;
  onTogglePanel?: () => void;
  isPanelCollapsed?: boolean;
  onUploadDiagram?: (xml: string) => void;
  onDownLoadSvg?: () => Promise<SaveSVGResult | undefined>;
  onDownloadXml?: () => Promise<SaveXMLResult | undefined>;
}

const BpmnControls: React.FC<BpmnControlsProps> = ({
  modeler,
  processKey,
  processName,
  onTogglePanel,
  isPanelCollapsed,
  onUploadDiagram,
  onDownLoadSvg,
  onDownloadXml,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { igrpToast } = useIGRPToast();

  // Download diagram as XML
  const handleDownloadDiagram = useCallback(async () => {
    if (!modeler) return;

    setIsLoading(true);
    try {
      const result = await onDownloadXml?.();
      const xml = result?.xml;
      if (!xml) {
        throw new Error("Invalid XML output from modeler.saveXML()");
      }

      const filename = generateFilename(processKey, processName, "bpmn");
      downloadFile(xml, filename, "application/xml");
      igrpToast({
        type: "success",
        title: "Diagram downloaded successfully!",
      });
    } catch (error) {
      showError("Error downloading diagram. Please try again.", error as Error);
      igrpToast({
        type: "error",
        title: "Error downloading diagram. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [modeler, processKey, processName]);

  // Download diagram as image (PNG)
  const handleDownloadImage = useCallback(async () => {
    if (!modeler) return;

    setIsLoading(true);
    try {
      const result = await onDownLoadSvg?.();

      if (typeof result?.svg !== "string" || result?.svg == null) {
        throw new Error("Invalid SVG output from modeler.saveSVG()");
      }
      const svgString = result.svg;

      // Prefer a data URL to avoid Blob-related edge cases
      const svgDataUrl =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

      // Determine output dimensions
      let renderWidth = 0;
      let renderHeight = 0;

      // Try extracting from viewBox as a fallback
      const viewBoxMatch = svgString.match(/viewBox=\"([\d\s.-]+)\"/i);
      if (viewBoxMatch && viewBoxMatch[1]) {
        const parts = viewBoxMatch[1].split(/\s+/).map(Number);
        if (parts.length === 4) {
          renderWidth = Math.max(1, Math.floor(parts[2] ?? 0));
          renderHeight = Math.max(1, Math.floor(parts[3] ?? 0));
        }
      }

      // Create canvas for conversion
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas 2D context not available");
      }

      // Load the SVG into an Image element
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const naturalW = (img as HTMLImageElement).naturalWidth || img.width;
          const naturalH =
            (img as HTMLImageElement).naturalHeight || img.height;

          const width = renderWidth || naturalW || 1024;
          const height = renderHeight || naturalH || 768;

          // Set canvas size with higher resolution
          const scale = 2;
          tempCanvas.width = width * scale;
          tempCanvas.height = height * scale;
          ctx.setTransform(scale, 0, 0, scale, 0, 0);
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        };
        img.onerror = () => reject(new Error("Failed to load SVG into image"));
        img.src = svgDataUrl;
      });

      // Export canvas to PNG blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        tempCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
          "image/png",
          0.95,
        );
      });

      const filename = generateFilename(processKey, processName, "png");
      downloadFile(blob, filename, "image/png");
      igrpToast({
        type: "success",
        title: "Image downloaded successfully!",
      });
    } catch (error) {
      showError("Error downloading image. Please try again.", error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [modeler, processKey, processName]);

  // Upload diagram from file
  const handleUploadDiagram = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !modeler) return;

      setIsLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const xml = e.target?.result as string;
            onUploadDiagram?.(xml);

            igrpToast({
              type: "success",
              title: "Diagram uploaded successfully!",
            });

            // Clear the file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (error) {
            showError(
              "Error importing diagram. Please check if the file is a valid BPMN XML file.",
              error as Error,
            );
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsText(file);
      } catch (error) {
        showError("Error reading file. Please try again.", error as Error);
        setIsLoading(false);
      }
    },
    [modeler],
  );

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Download diagram as SVG
  const handleDownloadSvg = useCallback(async () => {
    if (!modeler) return;

    setIsLoading(true);
    try {
      const result = await onDownLoadSvg?.();

      if (typeof result?.svg !== "string" || result?.svg == null) {
        throw new Error("Invalid SVG output from modeler.saveSVG()");
      }
      const svgString = result.svg;

      const filename = generateFilename(processKey, processName, "svg");
      downloadFile(svgString, filename, "image/svg+xml");
      igrpToast({
        type: "success",
        title: "SVG downloaded successfully!",
      });
    } catch (error) {
      showError("Error downloading SVG. Please try again.", error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [modeler, processKey, processName]);

  return (
    <div className="flex flex-col gap-1">
      {/* Toggle Properties Panel */}
      {onTogglePanel && (
        <IGRPButton
          onClick={onTogglePanel}
          title={
            isPanelCollapsed ? "Show Properties Panel" : "Hide Properties Panel"
          }
          size={"icon"}
          variant="outline"
          disabled={isLoading}
          iconName={isPanelCollapsed ? "PanelRightOpen" : "PanelRightClose"}
        ></IGRPButton>
      )}

      {onTogglePanel && <IGRPSeparator />}

      {/* Download Diagram as XML */}
      <IGRPButton
        onClick={handleDownloadDiagram}
        title="Download Diagram (XML)"
        size={"icon"}
        variant="outline"
        disabled={isLoading}
        iconName="FileText"
      ></IGRPButton>

      <IGRPSeparator />

      {/* Download Diagram as SVG */}
      <IGRPButton
        onClick={handleDownloadSvg}
        title="Download as SVG"
        size={"icon"}
        variant="outline"
        disabled={isLoading}
        iconName="Download"
      ></IGRPButton>

      <IGRPSeparator />

      {/* Download Diagram as Image */}
      <IGRPButton
        onClick={handleDownloadImage}
        title="Download as Image (PNG)"
        size={"icon"}
        variant="outline"
        disabled={isLoading}
        iconName="Image"
      ></IGRPButton>

      <IGRPSeparator />

      {/* Upload Diagram */}
      <IGRPButton
        onClick={handleUploadClick}
        title="Upload Diagram"
        size={"icon"}
        variant="outline"
        disabled={isLoading}
        iconName="Upload"
      ></IGRPButton>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".bpmn,.xml"
        onChange={handleUploadDiagram}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default BpmnControls;
