/**
 * ExportInstructionsModal
 *
 * Shows step-by-step instructions on how to load the exported
 * extension into Chrome after downloading the zip.
 */
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Apple, FolderOpen, ToggleRight } from "lucide-react";

interface ExportInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportInstructionsModal({ open, onOpenChange }: ExportInstructionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 gap-0 bg-[#232323] border border-[#5A9665]/50 max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-1">
          Load Your Extension in Chrome
        </h2>
        <p className="text-sm text-gray-400 mb-5">
          Follow these steps to install your extension.
        </p>

        <div className="space-y-5">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#5A9665] flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-white mb-2">Extract the zip file</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-300 bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                  <Monitor className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span><span className="text-white font-medium">Windows:</span> Right-click the zip file and click <span className="text-white font-medium">Extract All</span></span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-300 bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                  <Apple className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span><span className="text-white font-medium">Mac:</span> Double-click the zip file</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#5A9665] flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-white mb-2">Open Chrome Extensions</p>
              <p className="text-sm text-gray-400">
                Click the <span className="text-white font-medium">three dots</span> (&#8942;) in the top-right corner of Chrome, then go to <span className="text-white font-medium">Extensions</span> &rarr; <span className="text-white font-medium">Manage Extensions</span>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#5A9665] flex items-center justify-center text-white text-sm font-bold">
              3
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-white mb-2">Enable Developer Mode & Load Unpacked</p>
              <p className="text-sm text-gray-400 mb-3">
                Turn on <span className="text-white font-medium">Developer mode</span> in the top-right corner, then click <span className="text-white font-medium">Load unpacked</span> in the top-left.
              </p>
              {/* Visual recreation of the Developer Mode toggle */}
              <div className="inline-flex items-center gap-3 bg-[#2b2b2b] rounded-lg px-4 py-2.5 border border-[#3a3a3a]">
                <span className="text-sm text-gray-300 font-medium">Developer mode</span>
                <ToggleRight className="w-8 h-8 text-[#5A9665]" />
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#5A9665] flex items-center justify-center text-white text-sm font-bold">
              4
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-white mb-2">Select the extracted folder</p>
              <div className="flex items-start gap-2 text-sm text-gray-300 bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                <FolderOpen className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                <span>Select the folder you extracted in Step 1, and you should be good to go!</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full mt-5 bg-[#5A9665] hover:bg-[#4a8655] text-white"
        >
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
