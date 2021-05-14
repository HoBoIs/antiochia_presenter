module Main exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Regex
import String
import WebSocket


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- INIT


type alias Flags =
    { wsUrl : String
    }


type State
    = Songs
    | Talks
    | Settings
    | Musics


type alias Model =
    { state : State
    , wsUrl : String
    , input : String
    , songTitles : List String
    , talks : List String
    , musics : List String
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { state = Songs
      , wsUrl = flags.wsUrl
      , input = ""
      , songTitles = []
      , talks = []
      , musics =[]
      }
    , Cmd.none
    )



-- VIEW


flatten : String -> String
flatten str =
    str
        |> String.toLower
        |> Regex.replace Regex.All (Regex.regex "[á]") (\_ -> "a")
        |> Regex.replace Regex.All (Regex.regex "[é]") (\_ -> "e")
        |> Regex.replace Regex.All (Regex.regex "[í]") (\_ -> "i")
        |> Regex.replace Regex.All (Regex.regex "[óöő]") (\_ -> "o")
        |> Regex.replace Regex.All (Regex.regex "[úüű]") (\_ -> "u")


stateSelector : Html Msg
stateSelector =
    div [ id "stateSelectorContainer" ]
        [ button [ onClick (SwitchState Songs) ] [ text "Dalok" ]
        , button [ onClick (SwitchState Talks) ] [ text "Bevezetők" ]
        , button [ onClick (SwitchState Musics) ] [ text "Zenék" ]
        , button [ class "small", onClick (SwitchState Settings) ] [ text "⚙️" ]
        ]


view : Model -> Html Msg
view model =
    case model.state of
        Songs ->
            div [ id "songContainer" ]
                [ button [ onClick Prev ] [ text "<" ]
                , button [ onClick Next ] [ text ">" ]
                , input [ onInput Input, onClick (Input ""), value model.input ] []
                , div [ id "songTitleContainer" ]
                    (model.songTitles
                        |> List.filter
                            (\t ->
                                String.contains
                                    (flatten model.input)
                                    (flatten t)
                            )
                        |> List.map
                            (\t ->
                                div [ class "songTitle", onClick (SendSong t) ] [ text t ]
                            )
                    )
                , stateSelector
                ]

        Talks ->
            div [ id "talkContainer" ]
                [ button [ onClick Play ] [ text "Zene" ] -- "Play music"
                , button [ class "smallText", onClick Thanks ] [ text "Köszöntés" ] -- "Show thanks"
                , input [ onInput Input, onClick (Input ""), value model.input ] []
                , div [ id "talkTitleContainer" ]
                    (model.talks
                        |> List.filter
                            (\t ->
                                String.contains
                                    (flatten model.input)
                                    (flatten t)
                            )
                        |> List.map
                            (\t ->
                                div [ class "talkTitle", onClick (SendTalk t) ] [ text t ]
                            )
                    )
                , stateSelector
                ]

        Musics ->
            div [ id "musicContainer" ]
                [ 
                div [id "musicController"] 
                  [button  [ onClick PlayMusic ]  [ text "▶" ] -- "Play music"
                  , button [ onClick PauseMusic, class "middle"] [ text "⏸" ] -- "Pause music"
                  , button [ onClick StopMusic ]  [ text "⏹" ] -- "Stop music"
                  , button [ onClick SoundDown , class "low"]  [ text "🔉" ] 
                  , button [ onClick SoundUp , class "low"]    [ text "🔊" ] 
                  ]
                , input [ onInput Input, onClick (Input ""), value model.input ] []
                , div [ id "musicTitleContainer" ]
                    (model.musics
                        |> List.filter
                            (\t ->
                                String.contains
                                    (flatten model.input)
                                    (flatten t)
                            )
                        |> List.map
                            (\t ->
                                div [ class "musicTitle", onClick (SendMusic t) ] [ text t ]
                            )
                    )
                , stateSelector
                ]

        Settings ->
            div [ id "settingsContainer" ]
                [ button [ onClick Invert ] [ text "Invertálás" ] -- "Invert colors"
                , div [ id "marginControls" ]
                    [ button [ onClick <| Margin "l" "-" ] [ text "<" ]
                    , button [ onClick <| Margin "l" "+" ] [ text ">" ]
                    , div []
                        [ div []
                            [ button [ onClick <| Margin "t" "-" ] [ text "^" ]
                            , button [ onClick <| Margin "t" "+" ] [ text "v" ]
                            , button [ onClick <| Margin "x" "" ] [ text "x" ]
                            , button [ onClick <| Margin "b" "+" ] [ text "^" ]
                            , button [ onClick <| Margin "b" "-" ] [ text "v" ]
                            ]
                        ]
                    , button [ onClick <| Margin "r" "+" ] [ text "<" ]
                    , button [ onClick <| Margin "r" "-" ] [ text ">" ]
                    ]
                , div [ class "filler" ] []
                , stateSelector
                ]



-- Settings ->
--     div [ id "settingsContainer" ]
--         [ button [ onClick Invert ] [ text "Invertálás" ] -- "Invert colors"
--         , button [ onClick MarginUp ] [ text "Margó fel" ] -- "Margin up"
--         , button [ onClick MarginDown ] [ text "Margó le" ] -- "Margin down"
--         , div [ class "filler" ] []
--         , stateSelector
--         ]


viewMessage : String -> Html msg
viewMessage msg =
    div [] [ text msg ]



-- UPDATE


type Msg
    = WSData String
    | Input String
      -- Songs
    | SendSong String
    | Prev
    | Next
      -- Talks
    | SendTalk String
    | Play
    | Thanks
      -- Settings
    | Invert
    | Margin String String
      -- State Switch
    | SwitchState State
      -- Musics
    | SendMusic String
    | PlayMusic
    | PauseMusic
    | StopMusic
    | SoundDown
    | SoundUp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        WSData str ->
            if String.startsWith "SONGS:" str then
                { model | songTitles = str |> String.dropLeft 6 |> String.split ";" } ! []
            else if String.startsWith "TALKS:" str then
                { model | talks = str |> String.dropLeft 6 |> String.split ";" } ! []
            else if String.startsWith "MUSICS:" str then
                { model | musics = str |> String.dropLeft 7 |> String.split ";" } ! []
            else
                model ! []

        Input newInput ->
            { model | input = newInput } ! []

        SendSong title ->
            model ! [ WebSocket.send model.wsUrl ("SONG:" ++ title) ]

        Prev ->
            model ! [ WebSocket.send model.wsUrl "PREV:" ]

        Next ->
            model ! [ WebSocket.send model.wsUrl "NEXT:" ]

        SendTalk title ->
            model ! [ WebSocket.send model.wsUrl ("TALK:" ++ title) ]

        Play ->
            model ! [ WebSocket.send model.wsUrl "PLAY:" ]

        Thanks ->
            model ! [ WebSocket.send model.wsUrl "THANKS:" ]

        Invert ->
            model ! [ WebSocket.send model.wsUrl "INVERT:" ]

        Margin side direction ->
            model ! [ WebSocket.send model.wsUrl ("MARGIN:" ++ side ++ "|" ++ direction) ]

        SendMusic title ->
            model ! [ WebSocket.send model.wsUrl ("MUSIC:" ++ title) ]

        PlayMusic ->
            model ! [ WebSocket.send model.wsUrl "PLAYMUSIC:" ]

        PauseMusic ->
            model ! [ WebSocket.send model.wsUrl "PAUSEMUSIC:" ]

        StopMusic ->
            model ! [ WebSocket.send model.wsUrl "STOPMUSIC:" ]

        SoundDown ->
            model ! [ WebSocket.send model.wsUrl "SOUNDDOWN:" ]

        SoundUp ->
            model ! [ WebSocket.send model.wsUrl "SOUNDUP:" ]

        SwitchState state ->
            { model | state = state, input = "" } ! []



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    WebSocket.listen model.wsUrl WSData
