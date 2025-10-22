import React, { useState, useEffect, useCallback } from "react";
import { Maximize, ZoomIn, ZoomOut } from "lucide-react";
import {
  IGRPButton,
  IGRPSeparator,
} from "@igrp/igrp-framework-react-design-system";

interface ZoomControlsProps {
  modeler: any;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  modeler,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Zoom step size
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;

  // Initialize zoom level from canvas
  useEffect(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get("canvas");
      if (canvas) {
        setZoomLevel(canvas.zoom());
      }

      // Listen for zoom changes
      const eventBus = modeler.get("eventBus");
      if (eventBus) {
        const onZoomChanged = () => {
          setZoomLevel(canvas.zoom());
        };

        eventBus.on("canvas.viewbox.changed", onZoomChanged);

        return () => {
          eventBus.off("canvas.viewbox.changed", onZoomChanged);
        };
      }
    } catch (error) {
      console.error("Error initializing zoom level:", error);
    }
  }, [modeler]);

  // Zoom in function
  const handleZoomIn = useCallback(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get("canvas");
      const currentZoom = canvas.zoom();
      const newZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);

      canvas.zoom(newZoom);
    } catch (error) {
      console.error("Error handling zoom in:", error);
    }
  }, [modeler]);

  // Zoom out function
  const handleZoomOut = useCallback(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get("canvas");
      const currentZoom = canvas.zoom();
      const newZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);

      canvas.zoom(newZoom);
    } catch (error) {
      console.error("Error handling zoom out:", error);
    }
  }, [modeler]);

  // Reset zoom function (fit to viewport)
  const handleResetZoom = useCallback(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get("canvas");
      canvas.zoom("fit-viewport");
    } catch (error) {
      console.error("Error handling reset zoom:", error);
    }
  }, [modeler]);

  // Register keyboard shortcuts
  useEffect(() => {
    if (!modeler) return;

    try {
      const keyboard = modeler.get("keyboard");

      // Removida a linha que causava o erro: const keyboardBindings = keyboard.getBindings();

      // Add zoom in shortcut (Ctrl/Cmd + +)
      const zoomInListener = function (context: { keyEvent: any }) {
        const event = context.keyEvent;

        if (keyboard.isKey(["=", "+"], event) && keyboard.isCmd(event)) {
          handleZoomIn();
          return true;
        }
      };

      // Add zoom out shortcut (Ctrl/Cmd + -)
      const zoomOutListener = function (context: { keyEvent: any }) {
        const event = context.keyEvent;

        if (keyboard.isKey(["-", "_"], event) && keyboard.isCmd(event)) {
          handleZoomOut();
          return true;
        }
      };

      // Add reset zoom shortcut (Ctrl/Cmd + 0)
      const resetZoomListener = function (context: { keyEvent: any }) {
        const event = context.keyEvent;

        if (keyboard.isKey(["0"], event) && keyboard.isCmd(event)) {
          handleResetZoom();
          return true;
        }
      };

      // Add fullscreen shortcut (F11)
      const fullscreenListener = function (context: { keyEvent: any }) {
        const event = context.keyEvent;

        if (keyboard.isKey(["F11"], event)) {
          onToggleFullscreen?.();
          return true;
        }
      };

      keyboard.addListener(zoomInListener);
      keyboard.addListener(zoomOutListener);
      keyboard.addListener(resetZoomListener);
      if (onToggleFullscreen) {
        keyboard.addListener(fullscreenListener);
      }

      return () => {
        // Clean up keyboard listeners
        try {
          keyboard.removeListener(zoomInListener);
          keyboard.removeListener(zoomOutListener);
          keyboard.removeListener(resetZoomListener);
          if (onToggleFullscreen) {
            keyboard.removeListener(fullscreenListener);
          }
        } catch (error) {
          console.error("Error removing keyboard listeners:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up keyboard shortcuts:", error);
      // Continue rendering the component even if keyboard shortcuts fail
    }
  }, [
    modeler,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    onToggleFullscreen,
  ]);

  // Register touch gestures for pinch zoom
  useEffect(() => {
    if (!modeler) return;

    try {
      const canvas = modeler.get("canvas");
      if (!canvas || !canvas._container) return;

      const container = canvas._container;

      let initialDistance = 0;
      let initialZoom = 1;

      const handleTouchStart = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];

          initialDistance = Math.hypot(
            (touch2?.clientX ?? 0) - (touch1?.clientX ?? 0),
            (touch2?.clientY ?? 0) - (touch1?.clientY ?? 0),
          );

          initialZoom = canvas.zoom();
        }
      };

      const handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];

          const currentDistance = Math.hypot(
            (touch2?.clientX ?? 0) - (touch1?.clientX ?? 0),
            (touch2?.clientY ?? 0) - (touch1?.clientY ?? 0),
          );

          const distanceRatio = currentDistance / initialDistance;
          const newZoom = Math.min(
            Math.max(initialZoom * distanceRatio, MIN_ZOOM),
            MAX_ZOOM,
          );

          canvas.zoom(newZoom);

          event.preventDefault();
        }
      };

      container.addEventListener("touchstart", handleTouchStart);
      container.addEventListener("touchmove", handleTouchMove);

      return () => {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
      };
    } catch (error) {
      console.error("Error setting up touch gestures:", error);
      // Continue rendering the component even if touch gestures fail
    }
  }, [modeler]);

  return (
    <div className="flex flex-col gap-1">
      <IGRPButton
        onClick={handleZoomIn}
        title="Aumentar Zoom (Ctrl++)"
        size={"icon"}
        variant="outline"
        iconName="ZoomIn"
      ></IGRPButton>
      <IGRPSeparator />
      <IGRPButton
        onClick={handleZoomOut}
        title="Diminuir Zoom (Ctrl+-)"
        size={"icon"}
        variant="outline"
        iconName="ZoomOut"
      ></IGRPButton>
      <IGRPSeparator />
      {onToggleFullscreen && (
        <>
          <IGRPSeparator />
          <IGRPButton
            onClick={onToggleFullscreen}
            title={
              isFullscreen
                ? "Sair do Ecrã Completo (F11)"
                : "Ecrã Completo (F11)"
            }
            size={"icon"}
            variant="outline"
            iconName={isFullscreen ? "Minimize2" : "Maximize2"}
          ></IGRPButton>
        </>
      )}
    </div>
  );
};

export default ZoomControls;
