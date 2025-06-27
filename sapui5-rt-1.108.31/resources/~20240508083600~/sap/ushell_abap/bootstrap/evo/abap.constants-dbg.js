// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define([

], function () {
    "use strict";

    return {
        defaultUshellConfig: {
            defaultRenderer: "fiori2",
            ushell: {
                home: {
                    tilesWrappingType: "Hyphenated"
                },
                darkMode: {
                    enabled: true
                },
                spaces: {
                    myHome: {
                        enabled: true
                    }
                }
            },
            renderers: {
                fiori2: {
                    componentData: {
                        config: {
                            sessionTimeoutReminderInMinutes: 5,
                            sessionTimeoutIntervalInMinutes: -1,
                            sessionTimeoutTileStopRefreshIntervalInMinutes: 15,
                            enableContentDensity: true,
                            enableAutomaticSignout: true,
                            enablePersonalization: true,
                            enableAbout: true,
                            enableTagFiltering: false,
                            enableSearch: true,
                            enableSetTheme: true,
                            enableSetLanguage: true,
                            enableAccessibility: true,
                            enableHelp: false,
                            enableUserDefaultParameters: true,
                            preloadLibrariesForRootIntent: false,
                            enableNotificationsUI: false,
                            enableRecentActivity: true,
                            tilesWrappingType: "Hyphenated",
                            applications: {
                                "Shell-home": {
                                    enableEasyAccess: true,
                                    enableHideGroups: false,
                                    homePageGroupDisplay: "scroll",
                                    enableTileActionsIcon: false
                                }
                            },
                            rootIntent: "Shell-home"
                        }
                    }
                }
            },
            services: {
                Personalization: {
                    config: {
                        appVariantStorage: {
                            enabled: true,
                            adapter: {
                                module: "sap.ushell.adapters.AppVariantPersonalizationAdapter"
                            }
                        }
                    }
                },
                CrossApplicationNavigation: {
                    config: {
                        "sap-ushell-enc-test": false
                    }
                },
                NavTargetResolution: {
                    config: {
                        enableClientSideTargetResolution: true
                    }
                },
                Ui5ComponentLoader: {
                    config: {
                        amendedLoading: true
                    }
                },
                ShellNavigation: {
                    config: {
                        reload: false
                    }
                },
                UserDefaultParameterPersistence: {
                    adapter: {
                        module: "sap.ushell.adapters.local.UserDefaultParameterPersistenceAdapter"
                    }
                },
                Notifications: {
                    config: {
                        enabled: false,
                        serviceUrl: "/sap/opu/odata4/iwngw/notification/default/iwngw/notification_srv/0001",
                        webSocketUrl: "/sap/bc/apc/iwngw/notification_push_apc",
                        pollingIntervalInSeconds: 30,
                        enableNotificationsPreview: false
                    }
                },
                AllMyApps: {
                    config: {
                        enabled: true,
                        showHomePageApps: true,
                        showCatalogApps: true
                    }
                },
                NavigationDataProvider: {
                    adapter: {
                        module: "sap.ushell_abap.adapters.abap.ClientSideTargetResolutionAdapter"
                    }
                },
                PagePersistence: {
                    adapter: {
                        config: {
                            serviceUrl: "/sap/opu/odata/UI2/FDM_PAGE_RUNTIME_SRV/"
                        }
                    }
                },
                Menu: {
                    adapter: {
                        config: {
                            enabled: false
                        }
                    }
                }
            },
            // platform specific (ABAP) launchpad configuration
            launchpadConfiguration: {
                configurationFile: {
                    configurationFileFolderWhitelist: { // inclusive language FLPCOREANDUX-4020: this configuration parameter is deprecated and will be removed
                        "": true,
                        "cfg/": true,
                        "cfg/sap/": true,
                        "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/": true,
                        "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/cfg/": true,
                        "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/cfg/sap/": true,
                        "/sap/ushell_config/": true,
                        "/sap/bc/ui5_demokit/test-resources/sap/ushell/demoapps/LaunchpadConfigFileExamples/": true,
                        "/resources/sap/dfa/help/sap/cfg/": true,
                        "/sap/bc/ui5_ui5/ui2/ushell_me/sap/ushell/me/": true
                    }
                }
            },
            xhrLogon: {
                // Configuration for XHR-Logon mode. See SAP Note 2193513 for details.
                mode: "frame"
            },
            bootstrapPlugins: {
                UiAdaptationPersonalization: {
                    component: "sap.ushell.plugins.rta-personalize",
                    enabled: false
                }
            },
            ui5: {
                libs: {
                    "sap.ui.core": true,
                    "sap.m": true,
                    "sap.ushell": true
                }
            },
            // default for the UI5_PLACEHOLDER_SCREEN parameter is evaluated from "Manage Launchpad Settings"
            // app via ConfigurationDefaults service and has therefore be defined in client constants
            // (was false in 2111)
            // this setting is only evaluated by Fiori Elements framework and shall be removed in a future release
            apps: {
                placeholder: {
                    enabled: true
                }
            }
        }
    };

});
