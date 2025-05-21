import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
  usageCount: number;
}

interface Folder {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function FolderView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Fetch folder details
  const {
    data: folder,
    isLoading: isLoadingFolder,
    error: folderError,
  } = useQuery<Folder>({
    queryKey: ["folder", id],
    queryFn: async () => {
      const response = await api.get(`/folders/${id}`);
      return response.data;
    },
    retry: 1,
  });

  // Fetch snippets in folder
  const {
    data: snippets,
    isLoading: isLoadingSnippets,
    error: snippetsError,
  } = useQuery<Snippet[]>({
    queryKey: ["folder-snippets", id],
    queryFn: async () => {
      const response = await api.get(`/folders/${id}/snippets`);
      return response.data;
    },
    retry: 1,
  });

  // Delete snippet mutation
  const { mutate: deleteSnippet, isLoading: isDeleting } = useMutation({
    mutationFn: async (snippetId: string) => {
      await api.delete(`/snippets/${snippetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-snippets", id] });
      setDeleteDialogOpen(false);
      setSnippetToDelete(null);
    },
  });

  // Update snippet usage mutation
  const { mutate: updateUsage } = useMutation({
    mutationFn: async (snippetId: string) => {
      await api.post(`/snippets/${snippetId}/usage`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folder-snippets", id] });
    },
  });

  // Get unique languages for filter
  const languages = snippets
    ? [...new Set(snippets.map((snippet) => snippet.language))]
    : [];

  // Filter snippets
  const filteredSnippets = snippets?.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLanguage =
      languageFilter === "all" || snippet.language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const isLoading = isLoadingFolder || isLoadingSnippets;

  const handleCopy = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopySuccess(true);
      updateUsage(snippet.id);
    } catch (err) {
      setCopyError(true);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (folderError || snippetsError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {folderError ? "Error loading folder" : "Error loading snippets"}
        <Button
          size="small"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["folder", id] });
            queryClient.invalidateQueries({
              queryKey: ["folder-snippets", id],
            });
          }}
          sx={{ ml: 2 }}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  if (!folder) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Folder not found
      </Alert>
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
          <Box>
            <Typography variant="h4" component="h1">
              {folder.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {folder.description}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/snippets/new", { state: { folderId: id } })}
        >
          Add Snippet
        </Button>
      </Box>

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={languageFilter}
              label="Language"
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <MenuItem value="all">All Languages</MenuItem>
              {languages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Snippets Grid */}
      <Grid container spacing={3}>
        {filteredSnippets?.map((snippet) => (
          <Grid item xs={12} sm={6} md={4} key={snippet.id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    {snippet.title}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(snippet)}
                      color="primary"
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    maxHeight: "3em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {snippet.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <Chip
                    icon={<CodeIcon />}
                    label={snippet.language}
                    size="small"
                    color="primary"
                  />
                  {snippet.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Last used:{" "}
                    {new Date(snippet.lastUsedAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Used {snippet.usageCount} times
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => navigate(`/snippets/${snippet.id}`)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    setSnippetToDelete(snippet.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {/* Empty State */}
        {(!filteredSnippets || filteredSnippets.length === 0) && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No snippets found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || languageFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first snippet to this folder"}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Snippet copied to clipboard"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setCopySuccess(false)}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Copy Error Snackbar */}
      <Snackbar
        open={copyError}
        autoHideDuration={2000}
        onClose={() => setCopyError(false)}
        message="Failed to copy snippet"
        color="error"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSnippetToDelete(null);
        }}
      >
        <DialogTitle>Delete Snippet</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this snippet? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSnippetToDelete(null);
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => snippetToDelete && deleteSnippet(snippetToDelete)}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
