/**
 * Chrome Extension API Type Declarations
 * 
 * This file provides TypeScript type definitions for Chrome Extension APIs.
 * For full type support, install @types/chrome from npm.
 */

declare namespace chrome {
  namespace runtime {
    interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      origin?: string;
    }

    interface InstalledDetails {
      reason: 'install' | 'update' | 'chrome_update' | 'shared_module_update';
      previousVersion?: string;
      id?: string;
    }

    const onInstalled: {
      addListener(callback: (details: InstalledDetails) => void): void;
    };

    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
    };

    function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    function sendMessage(
      extensionId: string,
      message: any,
      responseCallback?: (response: any) => void
    ): void;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      windowId: number;
      active: boolean;
      pinned: boolean;
      url?: string;
      title?: string;
      favIconUrl?: string;
    }

    interface QueryInfo {
      active?: boolean;
      currentWindow?: boolean;
      url?: string | string[];
    }

    interface UpdateProperties {
      url?: string;
      active?: boolean;
      pinned?: boolean;
    }

    const onUpdated: {
      addListener(
        callback: (
          tabId: number,
          changeInfo: { status?: string; url?: string },
          tab: Tab
        ) => void
      ): void;
    };

    function query(queryInfo: QueryInfo): Promise<Tab[]>;
    function sendMessage(tabId: number, message: any, responseCallback?: (response: any) => void): void;
    function create(createProperties: { url?: string; active?: boolean }): Promise<Tab>;
    function update(tabId: number, updateProperties: UpdateProperties): Promise<Tab>;
  }

  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | null): Promise<{ [key: string]: any }>;
      set(items: { [key: string]: any }): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
    }

    const local: StorageArea;
    const sync: StorageArea;
    const session: StorageArea;

    const onChanged: {
      addListener(
        callback: (
          changes: { [key: string]: { oldValue?: any; newValue?: any } },
          areaName: 'local' | 'sync' | 'session'
        ) => void
      ): void;
    };
  }

  namespace action {
    interface BadgeDetails {
      text: string;
      tabId?: number;
    }

    interface BadgeColorDetails {
      color: string | [number, number, number, number];
      tabId?: number;
    }

    const onClicked: {
      addListener(callback: (tab: tabs.Tab) => void): void;
    };

    function setBadgeText(details: BadgeDetails): Promise<void>;
    function setBadgeBackgroundColor(details: BadgeColorDetails): Promise<void>;
    function setIcon(details: { path: string | { [size: string]: string } }): Promise<void>;
  }

  namespace scripting {
    interface ScriptInjection {
      target: { tabId: number; frameIds?: number[] };
      files?: string[];
      func?: () => void;
      args?: any[];
    }

    function executeScript(injection: ScriptInjection): Promise<any[]>;
  }

  namespace alarms {
    interface Alarm {
      name: string;
      scheduledTime: number;
      periodInMinutes?: number;
    }

    interface AlarmCreateInfo {
      when?: number;
      delayInMinutes?: number;
      periodInMinutes?: number;
    }

    const onAlarm: {
      addListener(callback: (alarm: Alarm) => void): void;
    };

    function create(name: string, alarmInfo: AlarmCreateInfo): void;
    function get(name: string): Promise<Alarm | undefined>;
    function getAll(): Promise<Alarm[]>;
    function clear(name: string): Promise<boolean>;
    function clearAll(): Promise<boolean>;
  }

  namespace contextMenus {
    interface CreateProperties {
      id?: string;
      title?: string;
      type?: 'normal' | 'checkbox' | 'radio' | 'separator';
      contexts?: string[];
      onclick?: (info: OnClickData, tab: tabs.Tab) => void;
    }

    interface OnClickData {
      menuItemId: string | number;
      parentMenuItemId?: string | number;
      mediaType?: string;
      linkUrl?: string;
      srcUrl?: string;
      pageUrl?: string;
      frameUrl?: string;
      selectionText?: string;
      editable: boolean;
    }

    const onClicked: {
      addListener(callback: (info: OnClickData, tab?: tabs.Tab) => void): void;
    };

    function create(createProperties: CreateProperties): string | number;
    function update(id: string | number, updateProperties: CreateProperties): Promise<void>;
    function remove(menuItemId: string | number): Promise<void>;
    function removeAll(): Promise<void>;
  }

  namespace notifications {
    interface NotificationOptions {
      type: 'basic' | 'image' | 'list' | 'progress';
      iconUrl: string;
      title: string;
      message: string;
      contextMessage?: string;
      priority?: number;
      buttons?: { title: string; iconUrl?: string }[];
      imageUrl?: string;
      items?: { title: string; message: string }[];
      progress?: number;
      requireInteraction?: boolean;
      silent?: boolean;
    }

    const onClicked: {
      addListener(callback: (notificationId: string) => void): void;
    };

    const onClosed: {
      addListener(callback: (notificationId: string, byUser: boolean) => void): void;
    };

    const onButtonClicked: {
      addListener(callback: (notificationId: string, buttonIndex: number) => void): void;
    };

    function create(notificationId: string, options: NotificationOptions): Promise<string>;
    function update(notificationId: string, options: NotificationOptions): Promise<boolean>;
    function clear(notificationId: string): Promise<boolean>;
  }
}

export {};

