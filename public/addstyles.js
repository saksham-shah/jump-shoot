function addStyles() {
    addTheme('default', {
        button: {
            default: {
                fill: 75,
                stroke: 45,
                text: 255,
                hover: {
                    fill: 100
                }
            },
            controls: {
                fill: 200,
                stroke: 20,
                text: 20,
                hover: {
                    fill: 180
                }
            }
        },
        chatbox: {
            chatbox: {
                // fill: -1,
                // stroke: -1,
                text: 175,
                bold: {
                    text: 255
                }
            },
            game: {
                fill: [0, 25],
                text: 175,
                bold: {
                    fill: [0, 75],
                    text: 255
                }
            }
        },
        checkbox: {
            default: {
                fill: 200,
                stroke: 20,
                hover: {
                    fill: 120,
                    stroke: 200
                },
                // checked: {
                //     fill: 255,
                //     stroke: 20
                // },
                // hoverchecked: {
                //     fill: 120,
                //     stroke: 200
                // }
            }
        },
        closebutton: {
            default: {
                fill: 75,
                cross: 200,
                stroke: 45,
                hover: {
                    fill: 200,
                    cross: 75
                }
            }
        },
        container: {
            default: {
                fill: [0, 25],
                stroke: [0, 50],
                header: [0, 75],
                text: 255
            },
            pause: {
                fill: 50,
                stroke: 75,
                header: 30,
                text: 255
            }
        },
        overlay: {
            default: {
                fill: 150,
                stroke: 200,
                header: 50,
                text: 255,
                background: [0, 150]
            }
        },
        screen: {
            default: {
                background: 50,
                outer: 60,
                stroke: 200,
                tooltip: {
                    fill: 200,
                    stroke: 50,
                    text: 20
                }
            },
            game: {
                background: 50,
                outer: 60,
                tooltip: {
                    fill: 200,
                    stroke: 50,
                    text: 20
                }
            }
        },
        scrollbar: {
            default: {
                fill: 100,
                // stroke: -1,
                hover: {
                    fill: 80
                }
            },
            chatbox: {
                fill: 30,
                // stroke: -1,
                hover: {
                    fill: 20
                }
            }
        },
        slider: {
            default: {
                line: 75,
                circle: 100,
                text: 200,
                hover: {
                    line: 50,
                    circle: 75,
                    text: 255
                }
            }
            // default: {
            //     line: 150,
            //     circle: 200,
            //     text: 30,
            //     hover: {
            //         line: 110,
            //         circle: 240,
            //         text: 0
            //     }
            // }
        },
        table: {
            default: {
                fill: 200,
                stroke: 20,
                text: 20,
                header: {
                    fill: 100,
                    text: 255
                },
                hover: {
                    fill: 150,
                    text: 255
                },
                alternate: {
                    fill: 180
                }
            }
        },
        textbox: {
            default: {
                fill: 220,
                // stroke: -1,
                text: 0,
                selection: 150,
                default: 100
            },
            game: {
                fill: [0, 50],
                text: 255,
                // stroke: -1,
                selection: [200, 50],
                default: 100
            }
        }
    }, true);
}