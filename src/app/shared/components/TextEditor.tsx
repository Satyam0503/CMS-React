import {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDebounce } from "../../hooks/useDebounce";
import { removeUnwantedString, sanitizeHtmlContent } from "../../../utils/common";
import { IntlContext } from "react-intl";
import {
  Box,
  Button,
  ButtonBase,
  Chip,
  FormHelperText,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import clsx from "clsx";
import { useIsDark } from "../../modules/theme/useIsDark";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import CodeRounded from "@mui/icons-material/CodeRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import RestoreOutlined from "@mui/icons-material/RestoreOutlined";

export type TextEditorToken = {
  token: string;
  label?: string;
  desc?: string;
};

export type TextEditorHandle = {
  insertText: (text: string) => void;
  focus: () => void;
  getEditor: () => any;
};

export type TextEditorProps = {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  height?: number | string;
  tokens?: TextEditorToken[];
  allowHtmlMode?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  onResetDefault?: () => void;
  resetDefaultLabel?: string;
};

const TextEditor = memo(
  forwardRef<TextEditorHandle, TextEditorProps>(
    (
      {
        value,
        setValue,
        placeholder = "PLACEHOLDER.TYPE_HERE",
        label,
        helperText,
        minHeight = 200,
        maxHeight,
        height,
        tokens,
        allowHtmlMode = false,
        disabled = false,
        error = false,
        className,
        onResetDefault,
        resetDefaultLabel,
      },
      ref
    ) => {
      const [textValue, setTextValue] = useState(value ?? "");
      const [isHtmlMode, setIsHtmlMode] = useState(false);
      const debouncedValue = useDebounce(textValue, 250);
      const intlContext = useContext(IntlContext);
      const isDark = useIsDark();
      const theme = useTheme();

      const quillRef = useRef<ReactQuill | null>(null);
      const textareaRef = useRef<HTMLTextAreaElement | null>(null);

      // Keep internal textValue synchronized with parent value updates
      useEffect(() => {
        if ((value ?? "") !== textValue) {
          setTextValue(value ?? "");
        }
      }, [value]);

      // Debounce and propagate sanitized changes up to parent
      useEffect(() => {
        const cleaned = removeUnwantedString(debouncedValue ?? "");
        const isQuillEmpty = cleaned === "<p><br></p>" || cleaned.trim() === "";
        const sanitized = isQuillEmpty ? "" : sanitizeHtmlContent(cleaned);
        if (sanitized !== (value ?? "")) {
          setValue(sanitized);
        }
      }, [debouncedValue]);

      const resolvedPlaceholder = useMemo(() => {
        if (!placeholder) return "";
        if (intlContext && placeholder.includes(".")) {
          try {
            return intlContext.formatMessage({ id: placeholder });
          } catch {
            return placeholder;
          }
        }
        return placeholder;
      }, [placeholder, intlContext]);

      const insertText = useCallback(
        (textToInsert: string) => {
          if (isHtmlMode) {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart ?? textValue.length;
              const end = textarea.selectionEnd ?? textValue.length;
              const next =
                textValue.substring(0, start) +
                textToInsert +
                textValue.substring(end);
              setTextValue(next);
              setValue(next);
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(
                  start + textToInsert.length,
                  start + textToInsert.length
                );
              }, 0);
              return;
            }
          }

          const editor = quillRef.current?.getEditor();
          if (editor) {
            try {
              const range = editor.getSelection() || {
                index: editor.getLength() - 1,
                length: 0,
              };
              editor.insertText(range.index, textToInsert);
              editor.setSelection(range.index + textToInsert.length, 0);
              const updatedHtml = editor.root.innerHTML;
              setTextValue(updatedHtml);
              setValue(sanitizeHtmlContent(removeUnwantedString(updatedHtml)));
              editor.focus();
              return;
            } catch {
              // Fallback to text append if Quill selection DOM API fails in headless/detached state
            }
          }

          const appended = (textValue ? textValue + " " : "") + textToInsert;
          setTextValue(appended);
          setValue(sanitizeHtmlContent(removeUnwantedString(appended)));
        },
        [isHtmlMode, textValue, setValue]
      );

      useImperativeHandle(
        ref,
        () => ({
          insertText,
          focus: () => {
            if (isHtmlMode) {
              textareaRef.current?.focus();
            } else {
              quillRef.current?.focus();
            }
          },
          getEditor: () => quillRef.current?.getEditor(),
        }),
        [insertText, isHtmlMode]
      );

      const modules = useMemo(
        () => ({
          toolbar: {
            container: [
              [{ header: [2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["blockquote", "link"],
              ["clean"],
            ],
          },
          clipboard: {
            matchVisual: true,
          },
        }),
        []
      );

      const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "list",
        "bullet",
        "blockquote",
        "link",
        "clean",
      ];

      const minHeightPx =
        typeof minHeight === "number" ? `${minHeight}px` : minHeight;

      return (
        <Box
          className={clsx("rich-text-editor-wrapper", className)}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Header Row: Label & Visual/HTML Mode Switcher */}
          {(label || allowHtmlMode || onResetDefault) && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
              sx={{ mb: 1 }}
            >
              <Box>
                {label && (
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color={error ? "error.main" : "text.secondary"}
                    sx={{ fontSize: "0.8rem", letterSpacing: "0.01em" }}
                  >
                    {label}
                  </Typography>
                )}
              </Box>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                {onResetDefault && (
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    startIcon={<RestoreOutlined sx={{ fontSize: "14px !important" }} />}
                    onClick={onResetDefault}
                    sx={{
                      fontSize: "0.72rem",
                      py: 0.25,
                      px: 1,
                      height: 26,
                      textTransform: "none",
                      color: "text.secondary",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {resetDefaultLabel || "Reset default"}
                  </Button>
                )}

                {allowHtmlMode && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      borderRadius: "8px",
                      bgcolor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "#F1F5F9",
                      p: 0.35,
                      border: "1px solid",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#E2E8F0",
                    }}
                  >
                    <ButtonBase
                      onClick={() => setIsHtmlMode(false)}
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: !isHtmlMode ? 800 : 600,
                        color: !isHtmlMode ? "primary.main" : "text.secondary",
                        bgcolor: !isHtmlMode
                          ? isDark
                            ? "rgba(30, 41, 59, 0.9)"
                            : "#FFFFFF"
                          : "transparent",
                        boxShadow: !isHtmlMode
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        transition: "all 0.18s ease",
                      }}
                    >
                      <EditNoteRounded sx={{ fontSize: 16 }} />
                      Visual Editor
                    </ButtonBase>
                    <ButtonBase
                      onClick={() => setIsHtmlMode(true)}
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: isHtmlMode ? 800 : 600,
                        color: isHtmlMode ? "primary.main" : "text.secondary",
                        bgcolor: isHtmlMode
                          ? isDark
                            ? "rgba(30, 41, 59, 0.9)"
                            : "#FFFFFF"
                          : "transparent",
                        boxShadow: isHtmlMode
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        transition: "all 0.18s ease",
                      }}
                    >
                      <CodeRounded sx={{ fontSize: 14 }} />
                      HTML Source
                    </ButtonBase>
                  </Box>
                )}
              </Stack>
            </Stack>
          )}

          {/* Tokens Bar */}
          {tokens && tokens.length > 0 && (
            <Box
              sx={{
                mb: 1.25,
                p: 1.25,
                borderRadius: "10px",
                border: "1px dashed",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "#CBD5E1",
                bgcolor: isDark
                  ? "rgba(15, 23, 42, 0.3)"
                  : alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack
                direction="row"
                spacing={0.85}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={800}
                  sx={{ fontSize: "0.74rem", mr: 0.5 }}
                >
                  Insert dynamic token at cursor:
                </Typography>
                {tokens.map(({ token, label: tokenLabel, desc }) => (
                  <Tooltip
                    key={token}
                    title={desc || `Click to insert ${token} at cursor position`}
                  >
                    <Chip
                      label={tokenLabel || token}
                      size="small"
                      variant="outlined"
                      clickable
                      onClick={() => insertText(token)}
                      icon={<AddRounded sx={{ fontSize: "13px !important" }} />}
                      sx={{
                        height: 25,
                        fontSize: "0.72rem",
                        fontFamily: "monospace",
                        fontWeight: 750,
                        cursor: "pointer",
                        borderRadius: "6px",
                        borderColor: isDark
                          ? "rgba(255,255,255,0.18)"
                          : "#CBD5E1",
                        bgcolor: isDark
                          ? "rgba(30, 41, 59, 0.6)"
                          : "#FFFFFF",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          transform: "translateY(-1px)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          )}

          {/* Editor Container */}
          <Box
            sx={{
              position: "relative",
              borderRadius: "12px",
              boxShadow: isDark
                ? "0 2px 10px rgba(0,0,0,0.25)"
                : "0 1px 4px rgba(15,23,42,0.03)",
              ...(height ? { height } : {}),
            }}
          >
            {isHtmlMode ? (
              <Box
                component="textarea"
                ref={textareaRef}
                value={textValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextValue(val);
                  setValue(val);
                }}
                disabled={disabled}
                placeholder="<p>Enter HTML email template here...</p>"
                spellCheck={false}
                sx={{
                  width: "100%",
                  minHeight: minHeightPx,
                  p: 2,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  color: isDark ? "#F1F5F9" : "#0F172A",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#F8FAFC",
                  border: "1px solid",
                  borderColor: error
                    ? "error.main"
                    : isDark
                    ? "rgba(255, 255, 255, 0.12)"
                    : "#CBD5E1",
                  borderRadius: "12px",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                  "&:focus": {
                    borderColor: "primary.main",
                    boxShadow: `0 0 0 2px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                }}
              />
            ) : (
              <Box
                sx={{
                  "& .ql-editor": {
                    minHeight: minHeightPx,
                    ...(maxHeight ? { maxHeight } : {}),
                  },
                }}
              >
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={textValue}
                  onChange={setTextValue}
                  formats={formats}
                  modules={modules}
                  readOnly={disabled}
                  placeholder={resolvedPlaceholder}
                  className={clsx("text-editor", {
                    dark: isDark,
                    light: !isDark,
                  })}
                />
              </Box>
            )}
          </Box>

          {/* Helper Text Footer */}
          {helperText && (
            <FormHelperText
              error={error}
              sx={{
                mt: 0.75,
                mx: 0.5,
                fontSize: "0.74rem",
                color: error ? "error.main" : "text.secondary",
              }}
            >
              {helperText}
            </FormHelperText>
          )}
        </Box>
      );
    }
  )
);

export default TextEditor;
