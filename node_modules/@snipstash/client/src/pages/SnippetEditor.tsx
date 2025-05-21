import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  folderId?: string;
}

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "json",
  "yaml",
  "markdown",
  "plaintext",
];

// Smart categorization rules
const CATEGORIZATION_RULES = [
  {
    pattern: /\b(for|while|forEach|map|filter|reduce)\b/,
    tag: "loop",
  },
  {
    pattern: /\b(fetch|axios|XMLHttpRequest|http\.|https\.)\b/,
    tag: "api",
  },
  {
    pattern: /\b(try|catch|finally|throw|Error)\b/,
    tag: "error-handling",
  },
  {
    pattern: /\b(map|filter|reduce|forEach|some|every)\b/,
    tag: "array-ops",
  },
  {
    pattern: /\b(console\.(log|error|warn|info|debug))\b/,
    tag: "debugging",
  },
  {
    pattern: /\b(async|await|Promise|then|catch)\b/,
    tag: "async",
  },
  {
    pattern:
      /\b(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef)\b/,
    tag: "react-hooks",
  },
  {
    pattern: /\b(if|else|switch|case|ternary)\b/,
    tag: "conditionals",
  },
  {
    pattern: /\b(function|=>|class|extends|implements)\b/,
    tag: "functions",
  },
  {
    pattern: /\b(import|export|require|module\.exports)\b/,
    tag: "modules",
  },
];

function generateSmartTags(content: string): string[] {
  const tags = new Set<string>();

  // Apply each rule to the content
  CATEGORIZATION_RULES.forEach((rule) => {
    if (rule.pattern.test(content)) {
      tags.add(rule.tag);
    }
  });

  // Add language-specific tags
  const language = content
    .match(
      /^(javascript|typescript|python|java|csharp|php|ruby|go|rust|swift|kotlin|html|css|sql|json|yaml|markdown|plaintext)$/i
    )?.[0]
    ?.toLowerCase();
  if (language) {
    tags.add(language);
  }

  return Array.from(tags);
}

export default function SnippetEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<Partial<Snippet>>({
    title: "",
    description: "",
    code: "",
    language: "plaintext",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch existing snippet if editing
  const { data: existingSnippet, isLoading: isLoadingSnippet } =
    useQuery<Snippet>({
      queryKey: ["snippet", id],
      queryFn: async () => {
        const response = await api.get(`/snippets/${id}`);
        return response.data;
      },
      enabled: isEditing,
    });

  // Update form data when existing snippet is loaded
  useEffect(() => {
    if (existingSnippet) {
      setFormData(existingSnippet);
    }
  }, [existingSnippet]);

  // Create or update snippet mutation
  const { mutate: saveSnippet, isLoading: isSaving } = useMutation({
    mutationFn: async (data: Partial<Snippet>) => {
      try {
        if (isEditing) {
          const response = await api.patch(`/snippets/${id}`, data);
          return response.data;
        } else {
          const response = await api.post("/snippets", data);
          return response.data;
        }
      } catch (error: any) {
        console.error("Save snippet error:", error.response?.data || error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save snippet";
      setFormErrors({
        ...formErrors,
        submit: errorMessage,
      });
    },
  });

  // Delete snippet mutation
  const { mutate: deleteSnippet, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error("No snippet ID available for deletion");
      }
      console.log("Attempting to delete snippet:", id);
      try {
        const response = await api.delete(`/snippets/${id}`);
        console.log("Delete response:", response);
        return response;
      } catch (error) {
        console.error("Delete error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Delete successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["snippets"] });
      navigate("/");
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      setFormErrors({
        ...formErrors,
        submit: "Failed to delete snippet. Please try again.",
      });
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.code?.trim()) {
      errors.code = "Code is required";
    }

    if (!formData.language) {
      errors.language = "Language is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Generate smart tags if no tags are provided
      const tags = formData.tags?.length
        ? formData.tags
        : generateSmartTags(formData.code || "");

      saveSnippet({
        ...formData,
        tags,
      });
    }
  };

  const handleChange = (field: keyof Snippet, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleChange("tags", [...(formData.tags || []), newTag.trim()]);
      setNewTag("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    handleChange(
      "tags",
      formData.tags?.filter((tag) => tag !== tagToDelete) || []
    );
  };

  // Add a button to generate smart tags
  const handleGenerateTags = () => {
    const smartTags = generateSmartTags(formData.code || "");
    handleChange("tags", smartTags);
  };

  if (isLoadingSnippet) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditing ? "Edit Snippet" : "New Snippet"}
          </Typography>
        </Box>
        {isEditing && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        )}
      </Box>

      {/* Form */}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        {formErrors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formErrors.submit}
          </Alert>
        )}
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
          </Grid>

          {/* Language */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.language} required>
              <InputLabel>Language</InputLabel>
              <Select
                value={formData.language || ""}
                label="Language"
                onChange={(e) => handleChange("language", e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.language && (
                <Typography color="error" variant="caption">
                  {formErrors.language}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">Tags</Typography>
                <Button
                  size="small"
                  onClick={handleGenerateTags}
                  disabled={!formData.code}
                >
                  Generate Smart Tags
                </Button>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {formData.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add Tag
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Code Editor */}
          <Grid item xs={12}>
            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
              <Editor
                height="400px"
                language={formData.language}
                value={formData.code || ""}
                onChange={(value) => handleChange("code", value)}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                }}
              />
            </Box>
            {formErrors.code && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {formErrors.code}
              </Typography>
            )}
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/")}
                disabled={isSaving || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSaving || isDeleting}
              >
                {isSaving ? "Saving..." : "Save Snippet"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          console.log("Dialog closed, current snippet ID:", id);
          setDeleteDialogOpen(false);
        }}
      >
        <DialogTitle>Delete Snippet</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this snippet? This action cannot be
            undone.
          </Typography>
          {id && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Snippet ID: {id}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              console.log("Cancel clicked, current snippet ID:", id);
              setDeleteDialogOpen(false);
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log("Delete clicked, current snippet ID:", id);
              if (id) {
                deleteSnippet();
              } else {
                console.error("No snippet ID available for deletion");
                setFormErrors({
                  ...formErrors,
                  submit: "Cannot delete: No snippet ID available",
                });
              }
            }}
            color="error"
            disabled={isDeleting || !id}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
